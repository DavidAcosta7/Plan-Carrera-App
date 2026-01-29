/**
 * Servicio centralizado de IA con Claude
 * Responsabilidades:
 * - Generar planes de carrera personalizados
 * - Mantener conversaciones contextuales
 * - Validar respuestas de IA
 * - Manejo de errores y retries
 */

class AIService {
    constructor(apiKey = null) {
        this.apiKey = apiKey || this.getApiKeyFromEnv();
        this.baseURL = 'https://api.anthropic.com/v1';
        this.model = 'claude-3-5-sonnet-20241022';
        this.maxTokens = 2048;
        this.isConfigured = !!this.apiKey;
        
        if (!this.isConfigured) {
            console.warn('⚠️ Claude API no configurada. Configura VITE_ANTHROPIC_API_KEY');
        } else {
            console.log('✅ Claude AI Service inicializado');
        }
    }

    /**
     * Obtiene API Key de variables de entorno o localStorage
     */
    getApiKeyFromEnv() {
        // Intenta cargar desde window (variables inyectadas)
        if (typeof window !== 'undefined' && window.CLAUDE_API_KEY) {
            return window.CLAUDE_API_KEY;
        }
        
        // Fallback a localStorage para pruebas
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('claude_api_key');
        }
        
        return null;
    }

    /**
     * Establece la API Key (para inicialización tardía)
     */
    setApiKey(key) {
        this.apiKey = key;
        this.isConfigured = !!key;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('claude_api_key', key);
        }
    }

    /**
     * Genera un plan de carrera completo basado en respuestas del usuario
     * @param {Object} userAnswers - Respuestas del onboarding
     * @returns {Promise<Object>} Plan generado por IA
     */
    async generateCareerPlan(userAnswers) {
        if (!this.isConfigured) {
            console.error('Claude API no está configurada');
            throw new Error('Claude API no configurada. Por favor configura VITE_ANTHROPIC_API_KEY');
        }

        try {
            const prompt = this.buildCareerPlanPrompt(userAnswers);
            const response = await this.callClaude(prompt);
            const parsedPlan = this.parseCareerPlan(response);
            
            // Validar estructura del plan
            this.validatePlanStructure(parsedPlan);
            
            return {
                success: true,
                plan: parsedPlan,
                generatedAt: new Date().toISOString(),
                userAnswers: userAnswers
            };
        } catch (error) {
            console.error('Error generando plan de carrera:', error);
            throw error;
        }
    }

    /**
     * Construye el prompt estructurado para generar un plan de carrera
     */
    buildCareerPlanPrompt(answers) {
        const {
            level = 'beginner',
            interests = [],
            timePerDay = '2',
            goal = 'work',
            deadline = '6',
            experience = ''
        } = answers;

        return `
You are an expert career coach and learning path designer specializing in technology careers. Your task is to generate a personalized, structured career plan based on the user's profile.

USER PROFILE:
- Current Level: ${level} (beginner/intermediate/advanced)
- Learning Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}
- Daily Available Time: ${timePerDay} hours
- Main Goal: ${goal} (job/freelance/promotion/personal-project)
- Target Deadline: ${deadline} months
- Previous Experience: ${experience || 'None mentioned'}

REQUIREMENTS:
Generate a comprehensive, personalized career plan in VALID JSON format ONLY. The plan must include:

1. A clear, motivating title matching the user's interests
2. 4-6 learning phases (progressive difficulty)
3. For EACH phase:
   - Title and duration (in weeks)
   - 5-10 core learning topics
   - 2-3 hands-on projects (easy, medium, hard difficulty levels)
   - Recommended courses/resources
   - Practice recommendations
   - Clear learning objectives

PROJECT STRUCTURE (each project must have):
- Unique ID
- Title with emoji
- Clear description
- Specific requirements list
- GitHub tips for presentation
- Difficulty level
- Estimated time to complete

IMPORTANT RULES:
- Adapt the entire plan to "${level}" skill level
- Focus on ${interests.join(' and ')} technologies
- Consider ${timePerDay} hours daily study time
- Structure all phases to be completable in ${deadline} months
- Each phase should build upon previous knowledge
- Include REAL, practical projects (not theoretical exercises)
- Make projects progressively more complex
- Suggest FREE and PAID resources as appropriate
- Include industry best practices and modern tools

RESPONSE FORMAT:
Return ONLY valid JSON, no markdown, no explanations, no extra text. Structure:

{
  "title": "Personalized plan title",
  "description": "Brief overview",
  "estimatedDuration": "X-Y months",
  "totalPhases": number,
  "objective": "Clear goal statement",
  "phases": [
    {
      "id": 1,
      "title": "Phase Title",
      "duration": "X-Y weeks",
      "icon": "appropriate-icon-name",
      "color": "bg-color-500",
      "learning_objectives": ["objective1", "objective2"],
      "topics": ["topic1", "topic2"],
      "projects": [
        {
          "id": "project-id",
          "title": "📊 Project Title",
          "description": "What you'll build",
          "difficulty": "easy|medium|hard",
          "estimatedTime": "X hours",
          "requirements": ["req1", "req2"],
          "githubTips": "How to present on GitHub"
        }
      ],
      "resources": [
        {
          "title": "Resource Name",
          "type": "course|book|tutorial|free",
          "url": "https://..."
        }
      ],
      "practice": "Specific practice recommendations"
    }
  ],
  "recommendations": {
    "studyTips": ["tip1", "tip2"],
    "commonMistakes": ["mistake1", "mistake2"],
    "nextSteps": ["step1", "step2"]
  }
}

Now generate the JSON plan:`;
    }

    /**
     * Realiza una llamada a la API de Claude
     */
    async callClaude(prompt, systemPrompt = null) {
        const headers = {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        };

        const body = {
            model: this.model,
            max_tokens: this.maxTokens,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        try {
            const response = await fetch(`${this.baseURL}/messages`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Claude API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (data.content && data.content.length > 0) {
                return data.content[0].text;
            }
            
            throw new Error('No content in Claude response');
        } catch (error) {
            console.error('Error calling Claude API:', error);
            throw error;
        }
    }

    /**
     * Parsea la respuesta JSON de Claude
     */
    parseCareerPlan(response) {
        try {
            // Intenta parsear directamente
            return JSON.parse(response);
        } catch (e) {
            // Si falla, busca JSON entre backticks o en el texto
            const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                            response.match(/({[\s\S]*})/);
            
            if (jsonMatch && jsonMatch[1]) {
                return JSON.parse(jsonMatch[1]);
            }
            
            throw new Error('No valid JSON found in Claude response');
        }
    }

    /**
     * Valida que la estructura del plan sea correcta
     */
    validatePlanStructure(plan) {
        const requiredFields = ['title', 'description', 'phases'];
        
        for (const field of requiredFields) {
            if (!plan[field]) {
                throw new Error(`Plan missing required field: ${field}`);
            }
        }

        if (!Array.isArray(plan.phases) || plan.phases.length === 0) {
            throw new Error('Plan must have at least one phase');
        }

        // Validar estructura de fases
        plan.phases.forEach((phase, index) => {
            if (!phase.title || !phase.topics) {
                throw new Error(`Phase ${index + 1} missing required fields`);
            }
        });

        return true;
    }

    /**
     * Actualiza un plan existente basado en nuevo feedback
     */
    async refineCareerPlan(currentPlan, feedback) {
        if (!this.isConfigured) {
            throw new Error('Claude API no configurada');
        }

        const prompt = `
You are a career coach reviewing and refining a personalized learning plan.

CURRENT PLAN:
${JSON.stringify(currentPlan, null, 2)}

USER FEEDBACK:
${feedback}

Please provide an updated plan in JSON format that addresses the user's feedback while maintaining the overall structure. Return only valid JSON.`;

        try {
            const response = await this.callClaude(prompt);
            return this.parseCareerPlan(response);
        } catch (error) {
            console.error('Error refining plan:', error);
            throw error;
        }
    }

    /**
     * Obtiene consejos personalizados para un proyecto específico
     */
    async getProjectAdvice(projectTitle, difficulty, userLevel) {
        if (!this.isConfigured) {
            throw new Error('Claude API no configurada');
        }

        const prompt = `
As a senior developer, provide specific, actionable advice for completing this project:

Project: ${projectTitle}
Difficulty: ${difficulty}
Developer Level: ${userLevel}

Include:
1. Step-by-step approach
2. Common pitfalls to avoid
3. Best practices
4. Resources to reference
5. Expected timeline

Be concise and practical.`;

        try {
            return await this.callClaude(prompt);
        } catch (error) {
            console.error('Error getting project advice:', error);
            throw error;
        }
    }

    /**
     * Genera feedback basado en código/progreso compartido
     */
    async generateFeedback(projectContext, submissionDetails) {
        if (!this.isConfigured) {
            throw new Error('Claude API no configurada');
        }

        const prompt = `
You are a senior code reviewer and mentor. Provide constructive feedback on this project submission:

PROJECT: ${projectContext.title}
LEVEL: ${projectContext.level}

SUBMISSION:
${submissionDetails}

Provide feedback covering:
1. Code quality and structure
2. Best practices adherence
3. Areas of improvement
4. Specific praise for what went well
5. Next learning recommendations

Be encouraging but honest.`;

        try {
            return await this.callClaude(prompt);
        } catch (error) {
            console.error('Error generating feedback:', error);
            throw error;
        }
    }

    /**
     * Responde preguntas en contexto de un plan específico
     */
    async answerPlanQuestion(plan, phase, question) {
        if (!this.isConfigured) {
            throw new Error('Claude API no configurada');
        }

        const prompt = `
You are a helpful learning mentor. Answer this specific question about the user's career plan.

PLAN CONTEXT:
Title: ${plan.title}
Current Phase: ${phase?.title || 'General'}

USER QUESTION: ${question}

Provide a helpful, concise answer that relates to their specific learning plan. Include relevant resources or next steps if applicable.`;

        try {
            return await this.callClaude(prompt);
        } catch (error) {
            console.error('Error answering question:', error);
            throw error;
        }
    }

    /**
     * Obtiene recomendaciones para el siguiente paso
     */
    async getNextStepRecommendation(plan, currentProgress) {
        if (!this.isConfigured) {
            throw new Error('Claude API no configurada');
        }

        const completedPhases = currentProgress.completedPhases || [];
        const completedProjects = currentProgress.completedProjects || [];

        const prompt = `
Based on the user's career plan and current progress, recommend the optimal next step.

PLAN TITLE: ${plan.title}
COMPLETED PHASES: ${completedPhases.length > 0 ? completedPhases.join(', ') : 'None'}
COMPLETED PROJECTS: ${completedProjects.length > 0 ? completedProjects.join(', ') : 'None'}

Provide a JSON response with:
{
  "recommendation": "Clear next step",
  "reason": "Why this is the best next step",
  "estimatedTime": "X hours",
  "resources": ["resource1", "resource2"]
}`;

        try {
            const response = await this.callClaude(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Error getting next step:', error);
            throw error;
        }
    }
}

// Instancia global
const aiService = new AIService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
}
