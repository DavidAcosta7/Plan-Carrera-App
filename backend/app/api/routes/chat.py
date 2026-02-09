from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app import models
from app.schemas import ChatRequest, ChatResponse
from app.services.groq_service import GroqService

router = APIRouter(prefix="/chat", tags=["Chat"])
groq_service = GroqService()


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Obtener plan activo del usuario para contexto
    active_plan = db.query(models.CareerPlan).filter(
        models.CareerPlan.user_id == current_user.id,
        models.CareerPlan.is_active == True
    ).first()

    # Obtener historial de chat reciente
    chat_history = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).order_by(models.ChatMessage.timestamp.desc()).limit(10).all()

    history = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(chat_history)
    ]

    # Preparar contexto del usuario
    user_context = {
        "plan_title": active_plan.title if active_plan else "Sin plan aún",
        "current_phase": "Fase 1",
        "progress_percentage": 0,
        "completed_projects": 0
    }

    try:
        response_text = await groq_service.chat_with_context(
            message=request.message,
            user_context=user_context,
            chat_history=history
        )

        # Guardar mensaje del usuario
        user_message = models.ChatMessage(
            user_id=current_user.id,
            role="user",
            content=request.message
        )
        db.add(user_message)

        # Guardar respuesta del asistente
        assistant_message = models.ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=response_text
        )
        db.add(assistant_message)

        db.commit()
        db.refresh(assistant_message)

        return ChatResponse(
            message=response_text,
            timestamp=assistant_message.timestamp
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el chat: {str(e)}"
        )
