from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routes import ai, chat

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plan Carrera API",
    description="API para planes de carrera y chat con IA (Groq)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "Plan Carrera API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
