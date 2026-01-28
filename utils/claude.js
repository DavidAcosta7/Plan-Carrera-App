// Integración con Claude API
class ClaudeAPI {
    constructor() {
        this.apiKey = null; // Se configurará en el dashboard
        this.baseURL = 'https://api.anthropic.com/v1';
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('claude_api_key', key);
    }

    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('claude_api_key');
        }
        return this.apiKey;
    }

    async generatePlan(responses) {
        const prompt = this.buildPlanPrompt(responses);
        
        try {
            const response = await this.makeRequest(prompt);
            return this.parsePlanResponse(response);
        } catch (error) {
            console.error('Error generando plan:', error);
            return this.getDefaultPlan(responses);
        }
    }

    async chat(message, context = []) {
        const prompt = this.buildChatPrompt(message, context);
        
        try {
            const response = await this.makeRequest(prompt);
            return response;
        } catch (error) {
            console.error('Error en chat:', error);
            return 'Lo siento, no puedo responder en este momento. Por favor, verifica tu API key de Claude.';
        }
    }

    buildPlanPrompt(responses) {
        return `
Como experto en desarrollo de software y creación de planes de carrera, genera un plan de aprendizaje personalizado basado en las siguientes respuestas:

Nivel actual: ${responses.level}
Intereses: ${responses.interests}
Tiempo disponible: ${responses.time} horas diarias
Objetivo: ${responses.goal}
Plazo: ${responses.deadline}
Experiencia previa: ${responses.experience}

Genera un plan estructurado con:
1. 4-6 fases de aprendizaje progresivas
2. Para cada fase: 3 proyectos prácticos (fácil, medio, difícil)
3. Temas específicos por fase
4. Cursos recomendados
5. Proyectos con requisitos claros
6. Sistema de desbloqueo basado en progreso

Responde en formato JSON con esta estructura:
{
  "title": "Título del plan personalizado",
  "description": "Descripción breve",
  "estimatedDuration": "X-X semanas",
  "phases": [
    {
      "id": 1,
      "title": "Título de la fase",
      "duration": "X-X semanas",
      "icon": "database",
      "color": "bg-blue-500",
      "items": ["tema1", "tema2", ...],
      "projects": [
        {
          "id": "project-id",
          "difficulty": "easy|medium|hard",
          "title": "Título del proyecto",
          "description": "Descripción",
          "requirements": ["req1", "req2", ...],
          "githubTips": "Consejos para GitHub",
          "unlockAt": 4
        }
      ],
      "courses": ["curso1", "curso2", ...],
      "practice": "Práctica recomendada"
    }
  ]
}

Adapta el contenido según el nivel y objetivos del usuario. Para principiantes, enfócate en fundamentos. Para avanzados, incluye temas más complejos.
`;
    }

    buildChatPrompt(message, context) {
        const contextString = context.length > 0 
            ? `Contexto anterior:\n${context.map(c => `${c.role}: ${c.message}`).join('\n')}\n\n`
            : '';

        return `${contextString}Eres un asistente experto en desarrollo de software y planes de carrera. Ayuda al usuario con su aprendizaje, resuelve dudas técnicas, da consejos sobre proyectos y guía su progreso.

Usuario: ${message}

Responde de manera útil, específica y motivadora.`;
    }

    async makeRequest(prompt) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API key no configurada');
        }

        const response = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    parsePlanResponse(response) {
        try {
            // Intentar parsear como JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Si no es JSON, crear plan por defecto
            return this.getDefaultPlan();
        } catch (error) {
            console.error('Error parseando respuesta:', error);
            return this.getDefaultPlan();
        }
    }

    getDefaultPlan(responses = {}) {
        return {
            title: "Plan de Carrera Personalizado",
            description: "Plan adaptado a tus objetivos y nivel actual",
            estimatedDuration: "16-24 semanas",
            phases: [
                {
                    id: 1,
                    title: "FASE 1: Fundamentos",
                    duration: "4-6 semanas",
                    icon: "database",
                    color: "bg-blue-500",
                    items: [
                        "Fundamentos de programación",
                        "Lógica y algoritmos",
                        "Estructuras de datos básicas",
                        "Control de flujo",
                        "Funciones y módulos"
                    ],
                    projects: [
                        {
                            id: "basic-project",
                            difficulty: "easy",
                            title: "🎯 Proyecto Inicial",
                            description: "Tu primer proyecto aplicando conceptos básicos",
                            requirements: [
                                "Implementar funcionalidades básicas",
                                "Usar estructuras de control",
                                "Documentar el código"
                            ],
                            githubTips: "Crea un README detallado y sube tu primer commit",
                            unlockAt: 3
                        }
                    ],
                    courses: ["Curso básico de programación"],
                    practice: "Ejercicios diarios de lógica"
                }
            ]
        };
    }
}

// Instancia global
const claudeAPI = new ClaudeAPI();

export default claudeAPI;
