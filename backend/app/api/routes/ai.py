from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app import models
from app.schemas import QuestionnaireAnswers, CareerPlanResponse, GeneratePlanFromChatRequest
from app.services.groq_service import GroqService

router = APIRouter(prefix="/ai", tags=["AI"])
groq_service = GroqService()


@router.post("/generate-plan", response_model=CareerPlanResponse)
async def generate_plan(
    answers: QuestionnaireAnswers,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        answers_dict = answers.model_dump()
        # Asegurar que interests sea lista para el join en el prompt
        if isinstance(answers_dict.get("interests"), str):
            answers_dict["interests"] = [answers_dict["interests"]]
        generated_plan = await groq_service.generate_career_plan(answers_dict)

        career_plan = models.CareerPlan(
            user_id=current_user.id,
            title=generated_plan["plan_title"],
            tech_stack=str(answers.interests),
            difficulty_level=answers.level,
            hours_per_day=answers.hours_per_day,
            goal=answers.goal,
            timeline_weeks=generated_plan.get("total_weeks", 24),
            generated_plan=generated_plan
        )

        db.add(career_plan)
        db.commit()
        db.refresh(career_plan)

        return career_plan

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generando el plan: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado: {str(e)}"
        )


@router.post("/generate-plan-from-chat", response_model=CareerPlanResponse)
async def generate_plan_from_chat(
    body: GeneratePlanFromChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Genera un plan de carrera a partir de un mensaje libre del usuario (ej. qué quiere estudiar)."""
    try:
        generated_plan = await groq_service.generate_career_plan_from_chat(body.message)

        career_plan = models.CareerPlan(
            user_id=current_user.id,
            title=generated_plan.get("plan_title", "Mi plan de carrera"),
            tech_stack=body.message,
            difficulty_level=None,
            hours_per_day=None,
            goal=None,
            timeline_weeks=generated_plan.get("total_weeks", 24),
            generated_plan=generated_plan
        )

        db.add(career_plan)
        db.commit()
        db.refresh(career_plan)

        return career_plan

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado: {str(e)}"
        )
