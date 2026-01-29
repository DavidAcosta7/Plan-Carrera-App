# Integración de Claude AI - Plan Carrera

## 🚀 Estado de Implementación

Este documento describe la integración completa de Claude AI en el proyecto "Plan Carrera".

### ✅ Completado

1. **Servicio de IA (AIService)**
   - Archivo: `utils/ai-service.js`
   - Funcionalidad: Generación de planes de carrera personalizados usando Claude
   - Métodos principales:
     - `generateCareerPlan(userAnswers)` - Genera plan completo basado en respuestas
     - `callClaude(prompt)` - Llamada directa a Claude API
     - `parseCareerPlan(response)` - Parsea respuesta JSON de IA
     - `validatePlanStructure(plan)` - Valida estructura del plan
     - `getProjectAdvice(projectTitle, difficulty, userLevel)` - Consejos para proyectos
     - `refineCareerPlan(currentPlan, feedback)` - Refina plan existente

2. **Servicio de Planes (PlanService)**
   - Archivo: `utils/plan-service.js`
   - Funcionalidad: Gestión de planes en Supabase
   - Métodos principales:
     - `savePlan(userId, plan, userAnswers)` - Guarda plan generado
     - `getUserPlans(userId)` - Obtiene todos los planes del usuario
     - `getPrimaryPlan(userId)` - Obtiene plan activo principal
     - `setPrimaryPlan(planId)` - Establece plan como primario
     - `saveProgress(userId, planId, progress)` - Guarda progreso
     - `getProgress(userId, planId)` - Obtiene progreso del usuario
     - `getPlanStats(userId, planId)` - Estadísticas del plan

3. **Servicio de Autenticación Mejorado (AuthService)**
   - Archivo: `utils/auth-service.js`
   - Funcionalidad: Gestión de autenticación + detección de primer login
   - Métodos principales:
     - `checkIsFirstTime(userId)` - Verifica si es primer login
     - `markOnboardingComplete(userId)` - Marca onboarding como completado
     - Integración con Supabase + localStorage fallback

4. **Flujo de Onboarding Mejorado**
   - Archivo: `pages/onboarding.html`
   - Características:
     - 5 preguntas optimizadas (sin pregunta de experiencia previa)
     - Campos nombrados correctamente para IA: `level`, `interests`, `timePerDay`, `goal`, `deadline`
     - Validación de respuestas
     - Llamada a `aiService.generateCareerPlan(userAnswers)`
     - Guardado en Supabase via `planService.savePlan()`
     - Estados: Preguntas → Loading → Éxito/Error

5. **Dashboard Refactorizado**
   - Archivo: `pages/dashboard.html`
   - Características:
     - Muestra lista de planes por usuario
     - Botón "Nuevo Plan de Carrera" para crear planes adicionales
     - Modal de confirmación antes de crear nuevo plan
     - Gestión de múltiples planes
     - Eliminación de planes (soft delete)
     - Estados: Cargando → Lista de planes / Empty state

6. **Schema SQL de Supabase**
   - Archivo: `supabase-schema-ai-plans.sql`
   - Tablas creadas:
     - `career_plans` - Planes generados por IA
     - `plan_progress` - Progreso del usuario en cada plan
     - `plan_generation_log` - Auditoría de generación
     - `onboarding_responses` - Respuestas del onboarding
   - RLS Policies implementadas
   - Triggers para auditoría automática

---

## 📋 Instrucciones de Configuración

### 1. Configurar Claude API Key

```bash
# Opción A: Variables de entorno (Recomendado)
export VITE_ANTHROPIC_API_KEY="sk-ant-..."

# Opción B: Inyectar en window (para desarrollo)
# En index.html antes de los scripts:
<script>
  window.CLAUDE_API_KEY = "sk-ant-...";
</script>

# Opción C: localStorage (temporal)
localStorage.setItem('claude_api_key', 'sk-ant-...');
```

### 2. Configurar Supabase

```bash
# Crear tablas ejecutando el schema SQL en Supabase
# 1. Ir a: Supabase Dashboard → SQL Editor
# 2. Crear nueva consulta
# 3. Copiar contenido de: supabase-schema-ai-plans.sql
# 4. Ejecutar

# Alternativa por CLI:
supabase db push
```

### 3. Inicializar Servicios en el Frontend

```javascript
// Los servicios se inicializan automáticamente:

// 1. AIService
const aiService = new AIService(); // Lee API key de env/localStorage
aiService.setApiKey("tu-api-key"); // Opcional si quieres configurar después

// 2. PlanService (requiere Supabase configurado)
const planService = new PlanService(supabaseClient);

// 3. AuthService (requiere Supabase configurado)
const authService = new AuthService(supabaseClient);
```

---

## 🔄 Flujos de Usuario

### Flujo 1: Primer Login (Nuevo Usuario)

```
1. Usuario registra cuenta
2. Redirige a /onboarding
3. AuthService.checkIsFirstTime() retorna true
4. Muestra formulario de 5 preguntas
5. Usuario responde preguntas (obligatorias)
6. Click "Generar Mi Plan"
7. AIService.generateCareerPlan() envía respuestas a Claude
8. Claude genera JSON estructurado
9. PlanService.savePlan() guarda en Supabase
10. AuthService.markOnboardingComplete()
11. Redirige a /dashboard
12. Dashboard muestra plan generado
```

### Flujo 2: Login Recurrente (Usuario con Plan)

```
1. Usuario login exitoso
2. AuthService.checkIsFirstTime() retorna false
3. Redirige directamente a /dashboard
4. Dashboard carga lista de planes: PlanService.getUserPlans()
5. Muestra:
   - Lista de planes generados
   - Botón "Nuevo Plan de Carrera"
   - Estadísticas de cada plan
```

### Flujo 3: Crear Nuevo Plan (Usuario Existente)

```
1. Usuario en dashboard
2. Click "Nuevo Plan de Carrera"
3. Modal de confirmación
4. Click "Comenzar"
5. Redirige a /onboarding (restablecido)
6. Repite flujo 1 desde paso 4
7. Nuevo plan se guarda sin sobrescribir anteriores
8. Vuelve al dashboard
9. Dashboard muestra ambos planes
```

---

## 🧠 Prompt de Claude

El prompt enviado a Claude incluye:

```
- Nivel actual: beginner/intermediate/advanced
- Intereses: Array de tecnologías (Python, JavaScript, SQL, etc.)
- Tiempo disponible: Horas diarias
- Objetivo: Tipo de meta (job, freelance, promotion, project)
- Plazo: Meses para lograrlo (3, 6, 12)
- Experiencia previa: Texto libre (opcional)
```

Claude retorna JSON con estructura:

```json
{
  "title": "Plan personalizado",
  "description": "Descripción",
  "estimatedDuration": "X-Y meses",
  "totalPhases": 4,
  "objective": "Objetivo claro",
  "phases": [
    {
      "id": 1,
      "title": "Fase 1",
      "duration": "4-6 semanas",
      "topics": ["topic1", "topic2"],
      "projects": [
        {
          "id": "proj-1",
          "title": "Proyecto 1",
          "difficulty": "easy",
          "requirements": ["req1", "req2"],
          "githubTips": "Tips para GitHub"
        }
      ],
      "resources": [
        {
          "title": "Resource",
          "type": "course",
          "url": "https://..."
        }
      ]
    }
  ],
  "recommendations": {
    "studyTips": ["tip1"],
    "commonMistakes": ["mistake1"],
    "nextSteps": ["step1"]
  }
}
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: career_plans
```sql
id (UUID, PK)
user_id (UUID, FK → auth.users)
title (TEXT)
description (TEXT)
objective (TEXT)
estimated_duration (TEXT)
total_phases (INTEGER)
plan_content (JSONB) -- JSON generado por IA
user_answers (JSONB) -- Respuestas que originaron el plan
status (VARCHAR) -- active, archived, deleted
is_primary (BOOLEAN) -- Un plan activo por usuario
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Tabla: plan_progress
```sql
id (UUID, PK)
user_id (UUID, FK)
plan_id (UUID, FK → career_plans)
completed_phases (JSONB) -- Array de IDs
completed_projects (JSONB) -- Array de IDs
expanded_phases (JSONB) -- Array de IDs expandidas
last_updated (TIMESTAMP)
```

### Tabla: plan_generation_log
```sql
id (UUID, PK)
user_id (UUID, FK)
plan_id (UUID, FK)
prompt_used (TEXT)
model_used (VARCHAR)
generation_time_ms (INTEGER)
success (BOOLEAN)
error_message (TEXT)
created_at (TIMESTAMP)
```

---

## 🔐 Seguridad

1. **RLS Policies**: Usuarios solo ven sus propios planes
2. **API Key**: Debe estar en variables de entorno (nunca en código)
3. **Soft Delete**: Los planes se marcan como "deleted" en lugar de borrarse
4. **Auditoría**: plan_generation_log registra todas las generaciones

---

## 🐛 Troubleshooting

### Error: "Claude API no está configurada"

**Solución:**
```javascript
// Verificar que la API Key está disponible
console.log(aiService.isConfigured); // Debe ser true

// Configurar manualmente si es necesario
aiService.setApiKey("sk-ant-...");
```

### Error: "Supabase no está configurado"

**Solución:**
```javascript
// Verificar variables de entorno
console.log(window.SUPABASE_CONFIG);

// Configurar manualmente si es necesario
const supabaseClient = new SupabaseClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### Error: "No valid JSON found in Claude response"

**Solución:**
- Aumentar `maxTokens` en AIService (línea 11)
- Revisar el prompt para asegurar que pide JSON válido
- Usar modelo más reciente: `claude-3-5-sonnet-20241022`

### Planes no se guardan en Supabase

**Solución:**
- Verificar que RLS policies están activas
- Confirmar que el usuario está autenticado (auth.uid() no null)
- Verificar logs en Supabase: Monitoring → Logs

---

## 📝 Próximas Mejoras

- [ ] Edición de planes existentes
- [ ] Chat contextual con IA durante el aprendizaje
- [ ] Seguimiento de progreso en tiempo real
- [ ] Recomendaciones de recursos basadas en progreso
- [ ] Exportar plan a PDF
- [ ] Integración con GitHub para mostrar contribuciones
- [ ] Notificaciones de progreso
- [ ] Feedback de IA en proyectos completados
- [ ] Multi-idioma

---

## 📚 Archivos Clave

| Archivo | Descripción |
|---------|------------|
| `utils/ai-service.js` | Servicio central de Claude IA |
| `utils/plan-service.js` | Gestión de planes en BD |
| `utils/auth-service.js` | Autenticación mejorada |
| `pages/onboarding.html` | Flujo de preguntas personalizadas |
| `pages/dashboard.html` | Gestión de múltiples planes |
| `supabase-schema-ai-plans.sql` | Schema completo de BD |
| `index.html` | Punto de entrada + carga de servicios |

---

## 🎯 Reglas de Implementación Respetadas

✅ **IA es el núcleo**: Todos los planes se generan con Claude
✅ **Sin planes predefinidos**: No existen datos estáticos en data.js
✅ **Primer login integrado**: Detecta automáticamente y redirige a onboarding
✅ **Múltiples planes**: Los usuarios pueden crear nuevos planes sin sobrescribir
✅ **Persistencia completa**: Planes guardados en Supabase, no solo localStorage
✅ **Prompts estructurados**: JSON válido y parseado correctamente
✅ **Flujo funcional**: Login → Preguntas → IA → Plan → Dashboard

---

## 🔗 Recursos Externos

- [Claude API Docs](https://docs.anthropic.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Versión**: 1.0.0
**Última actualización**: 29 de enero de 2026
**Estado**: ✅ Implementación Completa
