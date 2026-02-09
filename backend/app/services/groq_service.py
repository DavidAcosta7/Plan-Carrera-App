from groq import Groq
from app.config import settings
from typing import List, Dict
import json


class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        # Modelo Llama 3.3 70B (producción) - llama-3.1-70b está deprecado
        self.model = "llama-3.3-70b-versatile"

    async def generate_career_plan(self, answers: Dict) -> Dict:
        """
        Generar plan de carrera personalizado usando Groq AI

        Args:
            answers: Diccionario con respuestas del cuestionario

        Returns:
            Dict con estructura del plan de carrera
        """

        prompt = f"""Eres un experto mentor en tecnología y desarrollo de carrera. Genera un plan de carrera personalizado DETALLADO en formato JSON válido.

**Perfil del Usuario:**
- Nivel actual: {answers.get('level', 'beginner')}
- Tecnologías de interés: {', '.join(answers.get('interests', ['Python', 'SQL']))}
- Tiempo disponible diario: {answers.get('hours_per_day', 2)} horas
- Objetivo principal: {answers.get('goal', 'Aprender programación')}
- Plazo deseado: {answers.get('timeline_weeks', 24)} semanas
- Experiencia previa: {answers.get('previous_experience', 'Ninguna')}
- Estilo de aprendizaje preferido: {answers.get('learning_style', 'mixto')}

**INSTRUCCIONES:**
Crea un plan estructurado con 4-5 fases progresivas. Cada fase DEBE incluir:

1. **Información general:**
   - id: número de fase (1, 2, 3, 4, 5)
   - title: Título descriptivo y motivador
   - duration_weeks: Duración realista en semanas
   - description: Párrafo explicando qué se logrará en esta fase

2. **learning_items:** Array con MÍNIMO 10 objetivos específicos de aprendizaje
   - Deben ser concretos y accionables
   - Progresión de básico a avanzado

3. **projects:** Array con EXACTAMENTE 3 proyectos
   - **Proyecto Fácil:**
     * difficulty: "easy"
     * title: Nombre del proyecto
     * description: Qué construirá el usuario
     * requirements: Array con 5-7 requisitos técnicos específicos
     * github_tips: Consejos para documentar en GitHub
     * technologies: Array de tecnologías a usar

   - **Proyecto Medio:**
     * difficulty: "medium"
     * (misma estructura que fácil, 7-9 requisitos)

   - **Proyecto Difícil:**
     * difficulty: "hard"
     * (misma estructura que fácil, 9-12 requisitos)

4. **resources:** Array con 3-5 recursos de aprendizaje
   - title: Nombre del recurso
   - url: URL real o placeholder realista
   - type: "course" | "documentation" | "video" | "book"

**IMPORTANTE:**
- Responde ÚNICAMENTE con JSON válido
- NO incluyas markdown (```json)
- NO agregues comentarios
- Asegura que sea parseable con json.loads()
- Todo en español
- URLs realistas (Coursera, Udemy, YouTube, docs oficiales)

**FORMATO DE RESPUESTA (JSON puro):**
{{
  "plan_title": "Nombre motivador del plan completo",
  "total_weeks": número total de semanas,
  "phases": [
    {{
      "id": 1,
      "title": "Fase 1: Fundamentos",
      "duration_weeks": 6,
      "description": "Descripción de la fase",
      "learning_items": [
        "Item de aprendizaje 1",
        "Item de aprendizaje 2",
        "... hasta 10+"
      ],
      "projects": [
        {{
          "difficulty": "easy",
          "title": "Proyecto Inicial",
          "description": "Qué se construye",
          "requirements": ["req1", "req2", "req3", "req4", "req5"],
          "github_tips": "Consejos para el README",
          "technologies": ["tech1", "tech2"]
        }},
        {{
          "difficulty": "medium",
          "title": "Proyecto Intermedio",
          "description": "...",
          "requirements": ["..."],
          "github_tips": "...",
          "technologies": ["..."]
        }},
        {{
          "difficulty": "hard",
          "title": "Proyecto Avanzado",
          "description": "...",
          "requirements": ["..."],
          "github_tips": "...",
          "technologies": ["..."]
        }}
      ],
      "resources": [
        {{
          "title": "Nombre del curso",
          "url": "https://ejemplo.com",
          "type": "course"
        }}
      ]
    }}
  ]
}}
"""

        content = ""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un experto mentor en programación. Respondes SIEMPRE en español con JSON válido sin markdown."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=4000,
                top_p=1,
                stream=False
            )

            content = chat_completion.choices[0].message.content.strip()

            # Limpiar posible markdown
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            elif content.startswith("```"):
                content = content.replace("```", "").strip()

            # Parsear JSON
            plan_data = json.loads(content)

            return plan_data

        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            print(f"Content received: {content[:500] if content else 'N/A'}")
            raise ValueError(f"La IA no generó JSON válido: {str(e)}")
        except Exception as e:
            print(f"Error generating plan: {e}")
            raise

    async def generate_career_plan_from_chat(self, user_message: str) -> Dict:
        """
        Genera un plan de carrera a partir de un único mensaje del usuario
        (ej. "Quiero aprender SQL y Python para ciencia de datos").
        Devuelve la misma estructura que generate_career_plan.
        """
        prompt = f"""El usuario ha dicho lo siguiente sobre lo que quiere estudiar:

"{user_message}"

A partir de este mensaje, genera un plan de carrera personalizado DETALLADO en formato JSON válido. Usa el mismo formato exacto que en las instrucciones de generate_career_plan:

- plan_title: nombre motivador del plan
- total_weeks: número total de semanas (entre 12 y 52)
- phases: array de 4-5 fases. Cada fase debe tener:
  - id, title, duration_weeks, description
  - learning_items: array de mínimo 10 ítems de aprendizaje concretos
  - projects: exactamente 3 proyectos (difficulty: "easy", "medium", "hard") cada uno con title, description, requirements (array), github_tips, technologies (array)
  - resources: array de 3-5 recursos con title, url, type ("course"|"documentation"|"video"|"book")

Responde ÚNICAMENTE con JSON válido, sin markdown ni comentarios. Todo en español."""

        content = ""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "Eres un experto en planes de carrera. Respondes SIEMPRE en español con JSON válido sin markdown."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=4000,
                top_p=1,
                stream=False
            )
            content = chat_completion.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            elif content.startswith("```"):
                content = content.replace("```", "").strip()
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON (from chat): {e}")
            print(f"Content: {content[:500] if content else 'N/A'}")
            raise ValueError(f"La IA no generó JSON válido: {str(e)}")
        except Exception as e:
            print(f"Error in generate_career_plan_from_chat: {e}")
            raise

    async def chat_with_context(
        self,
        message: str,
        user_context: Dict,
        chat_history: List[Dict]
    ) -> str:
        """
        Chat conversacional con contexto del progreso del usuario

        Args:
            message: Mensaje del usuario
            user_context: Contexto del plan y progreso
            chat_history: Historial de mensajes previos

        Returns:
            String con la respuesta de la IA
        """

        system_prompt = f"""Eres un mentor experto en programación muy amigable, motivador y útil.

**Contexto del Usuario:**
- Plan de carrera: {user_context.get('plan_title', 'Aún no tiene plan definido')}
- Fase actual: {user_context.get('current_phase', 'Inicio del camino')}
- Progreso general: {user_context.get('progress_percentage', 0)}%
- Proyectos completados: {user_context.get('completed_projects', 0)}
- Últimos desafíos: {user_context.get('recent_challenges', 'No reportados aún')}

**Tu Rol y Estilo:**
- Ayudar con dudas técnicas de forma clara y práctica
- Motivar constantemente con energía positiva
- Explicar conceptos complejos de forma simple
- Sugerir recursos útiles cuando sea relevante
- Revisar código si lo comparten
- Dar feedback constructivo
- Usar emojis ocasionalmente (1-2 por mensaje) para ser amigable
- Ser conciso pero completo (máximo 4 párrafos cortos)

**Reglas:**
- Siempre en español
- Si no sabes algo, admítelo y sugiere dónde buscar
- Enfócate en soluciones prácticas
- Relaciona tus respuestas con su plan cuando sea relevante
- Celebra sus logros
"""

        messages = [{"role": "system", "content": system_prompt}]

        # Agregar historial reciente (últimos 8 mensajes para contexto)
        for msg in chat_history[-8:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # Mensaje actual del usuario
        messages.append({
            "role": "user",
            "content": message
        })

        if not (getattr(settings, "GROQ_API_KEY", None) or "").strip():
            return (
                "⚠️ El backend no tiene configurada GROQ_API_KEY. "
                "Añade GROQ_API_KEY en backend/.env y reinicia el servidor."
            )

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.8,
                max_tokens=600,
                top_p=1,
                stream=False
            )

            response = chat_completion.choices[0].message.content
            if not response or not response.strip():
                return "La IA no generó respuesta. Intenta de nuevo."
            return response

        except Exception as e:
            err_msg = str(e).strip() or type(e).__name__
            print(f"Error in chat: {e}")
            return (
                f"Error de Groq: {err_msg}. "
                "Revisa tu API key en backend/.env y que el modelo esté disponible."
            )
