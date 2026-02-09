from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """Obtiene el usuario actual. En desarrollo sin JWT, devuelve el primer usuario o uno por defecto."""
    if credentials and credentials.credentials:
        # Aquí se podría validar JWT y obtener user_id
        pass
    # Para desarrollo: usar primer usuario de la BD o crear uno por defecto
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="dev@plan-carrera.local",
            name="Usuario desarrollo"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
