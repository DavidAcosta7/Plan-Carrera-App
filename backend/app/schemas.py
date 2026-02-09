from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


# --- Questionnaire / Plan generation ---
class QuestionnaireAnswers(BaseModel):
    level: str = "beginner"
    interests: List[str] = ["Python", "SQL"]
    hours_per_day: int = 2
    goal: str = "Aprender programación"
    timeline_weeks: int = 24
    previous_experience: Optional[str] = None
    learning_style: Optional[str] = "mixto"


class GeneratePlanFromChatRequest(BaseModel):
    message: str


class CareerPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    tech_stack: Optional[Any] = None
    difficulty_level: Optional[str] = None
    hours_per_day: Optional[int] = None
    goal: Optional[str] = None
    timeline_weeks: Optional[int] = None
    generated_plan: Optional[Any] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Chat ---
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    message: str
    timestamp: Optional[datetime] = None


# --- User (for auth dependency) ---
class UserBase(BaseModel):
    email: str
    name: Optional[str] = None


class UserInDB(UserBase):
    id: int

    class Config:
        from_attributes = True
