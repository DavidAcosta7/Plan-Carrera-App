# Plan de Carrera Pro - Powered by Claude AI

🤖 **Plataforma SaaS inteligente que genera planes de carrera personalizados usando Claude IA de Anthropic**

La IA es el núcleo del producto. Cada usuario obtiene un plan 100% personalizado basado en sus respuestas a un flujo de onboarding.

---

## ✨ Características Principales

### 🧠 Generación Inteligente de Planes
- **IA Generativa**: Planes creados dinámicamente por Claude basados en:
  - Nivel actual (principiante, intermedio, avanzado)
  - Intereses tecnológicos (Python, JavaScript, SQL, Mobile, DevOps, AI/ML)
  - Tiempo disponible diario (1h, 2h, 3h+)
  - Objetivo profesional (trabajo, freelance, promoción, proyecto)
  - Plazo deseado (3, 6, 12 meses)

### 📚 Planes Personalizados
- **4-6 Fases Progresivas**: Adaptadas al perfil del usuario
- **2-3 Proyectos por Fase**: Easy, Medium, Hard (gradación de dificultad)
- **Recursos Recomendados**: Cursos, tutoriales, libros
- **Tips para GitHub**: Cómo presentar proyectos profesionalmente

### 👥 Multi-Usuario SaaS
- Autenticación con Supabase
- Múltiples planes por usuario
- Cada usuario tiene su dashboard personalizado
- Historial de planes y progreso

### 💾 Persistencia Completa
- Base de datos Supabase (PostgreSQL)
- Planes guardados con metadata
- Progreso sincronizado
- Auditoría de generación

### 🔐 Seguridad
- RLS Policies (Row Level Security)
- Usuarios solo ven sus propios datos
- API Keys en variables de entorno
- Soft delete (no borrado definitivo)

---

## 🚀 Quick Start (5 minutos)

### 1. Clonar Repositorio
```bash
git clone <repo-url>
cd Plan-Carrera-App
```

### 2. Obtener API Keys
- **Claude**: https://console.anthropic.com/ (obtén `sk-ant-...`)
- **Supabase**: https://app.supabase.com/ (obtén URL y Anon Key)

### 3. Configurar Entorno
```bash
cp .env.example .env.local
# Edita .env.local con tus keys:
# VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```

### 4. Setup Base de Datos
```bash
# 1. Abre Supabase SQL Editor
# 2. Copia contenido de: supabase-schema-ai-plans.sql
# 3. Ejecuta en Supabase
```

### 5. Iniciar
```bash
npm install
npm run dev
# Abre http://localhost:5173
```

**➡️ Ver guía detallada en [QUICK-START-CLAUDE.md](QUICK-START-CLAUDE.md)**

---

## 📋 Estructura del Proyecto

```
Plan-Carrera-App/
├── index.html                          # Punto de entrada
├── styles.css                          # Estilos principales
├── vite.config.js                      # Config Vite
│
├── utils/
│   ├── ai-service.js                   # ✨ Servicio Claude IA
│   ├── plan-service.js                 # 💾 Gestión de planes en BD
│   ├── auth-service.js                 # 👤 Autenticación mejorada
│   ├── supabase-client.js              # 🗄️ Cliente Supabase
│   ├── router.js                       # 🔄 SPA Router
│   └── claude.js                       # (Heredado, usar ai-service)
│
├── pages/
│   ├── landing.html                    # Landing page
│   ├── register.html                   # Registro
│   ├── login.html                      # Login
│   ├── onboarding.html                 # ✨ Flujo de 5 preguntas → Plan
│   ├── dashboard.html                  # 📊 Dashboard con múltiples planes
│   └── projects.html                   # Proyectos (futuro)
│
├── components/
│   └── chat.html                       # Chat component (futuro)
│
├── assets/                             # Imágenes, iconos
│
├── supabase-schema-ai-plans.sql        # 🗄️ Schema Supabase
│
├── AI-INTEGRATION.md                   # 📚 Documentación completa
├── IMPLEMENTATION-CHECKLIST.md         # ✅ Checklist de implementación
├── QUICK-START-CLAUDE.md               # 🚀 Guía rápida
│
└── README.md                           # Este archivo
```

---

## 🔄 Flujo de Usuario

### Primer Login (Usuario Nuevo)
```
1. Usuario se registra
2. Sistema detecta "primer login"
3. Redirige a /onboarding automáticamente
4. Usuario responde 5 preguntas
5. Claude IA genera plan personalizado
6. Plan se guarda en Supabase
7. Usuario ve dashboard con su plan
```

### Login Recurrente (Usuario Existente)
```
1. Usuario login exitoso
2. Sistema detecta "tiene planes"
3. Redirige directamente a /dashboard
4. Ve su(s) plan(es) guardado(s)
```

### Crear Nuevo Plan
```
1. En dashboard, click "Nuevo Plan de Carrera"
2. Modal de confirmación
3. Vuelve a onboarding (responde 5 preguntas nuevas)
4. Claude genera un NUEVO plan
5. Se guarda sin sobrescribir planes anteriores
6. Dashboard muestra ambos planes
```

---

## 🧠 Cómo Funciona la IA

### Prompt Enviado a Claude
```
- Nivel actual del usuario
- Intereses tecnológicos
- Horas disponibles por día
- Objetivo profesional
- Plazo para lograrlo
- Experiencia previa
```

### Respuesta de Claude (JSON)
```json
{
  "title": "Plan personalizado para ti",
  "description": "Descripción única",
  "estimatedDuration": "6 meses",
  "totalPhases": 4,
  "phases": [
    {
      "id": 1,
      "title": "Fundamentos",
      "duration": "4-6 semanas",
      "topics": ["tema1", "tema2"],
      "projects": [
        {
          "title": "Proyecto 1",
          "difficulty": "easy",
          "requirements": ["req1"],
          "githubTips": "..."
        }
      ],
      "resources": [...]
    }
  ]
}
```

### Validación
- Estructura JSON obligatoria
- Todas las fases deben tener proyectos
- Dificultad valida: easy/medium/hard
- Sin datos fijos ni hardcodeados

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales

**career_plans** - Planes generados por IA
```sql
- id (UUID)
- user_id (FK auth.users)
- title, description, objective
- plan_content (JSONB) ← Respuesta de Claude
- user_answers (JSONB) ← Respuestas del usuario
- is_primary (BOOLEAN) ← Plan activo
- created_at, updated_at
```

**plan_progress** - Seguimiento de progreso
```sql
- id (UUID)
- user_id, plan_id (FKs)
- completed_phases (JSONB)
- completed_projects (JSONB)
- last_updated
```

**plan_generation_log** - Auditoría
```sql
- id (UUID)
- user_id, plan_id
- prompt_used, model_used
- generation_time_ms, success, error_message
- created_at
```

---

## 🔐 Seguridad

- ✅ RLS Policies: Cada usuario solo ve sus datos
- ✅ API Keys en `.env` (nunca en código)
- ✅ Supabase Auth integrado
- ✅ Soft delete (status = 'deleted')
- ✅ Auditoría completa de generaciones

---

## 📚 Documentación

| Documento | Contenido |
|-----------|-----------|
| [AI-INTEGRATION.md](AI-INTEGRATION.md) | Integración completa de Claude, schema, RLS, troubleshooting |
| [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) | ✅ Checklist detallado de implementación |
| [QUICK-START-CLAUDE.md](QUICK-START-CLAUDE.md) | 🚀 Guía rápida en 5 minutos |

---

## 🛠️ Tech Stack

### Backend
- **API IA**: Claude (Anthropic)
- **Autenticación**: Supabase Auth
- **Base de Datos**: PostgreSQL (Supabase)
- **RLS**: Row Level Security

### Frontend
- **Framework**: HTML5, CSS3, Vanilla JavaScript
- **SPA Router**: Routing con hash
- **Diseño**: CSS Grid, Flexbox
- **Cliente Supabase**: JavaScript SDK

### Hosting
- **Vercel** (Recomendado) o cualquier static host
- **Supabase** para BD

---

## 🎯 Roadmap

### Fase 1 (Actual) ✅
- ✅ Integración Claude AI
- ✅ Generación de planes dinámicos
- ✅ Multi-usuario con Supabase
- ✅ Onboarding mejorado
- ✅ Dashboard con múltiples planes

### Fase 2 (Próxima)
- [ ] Chat contextual durante aprendizaje
- [ ] Refinamiento de planes con IA
- [ ] Análisis de progreso
- [ ] Integración GitHub

### Fase 3 (Futuro)
- [ ] Premium features
- [ ] Exportar PDF
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Multi-idioma

### FASE 5: Nivel Experto (Continuo)
- Optimización avanzada, Data Warehousing
- Proyectos: Dashboard Analytics, Query Optimizer, Data Warehouse

## 🚀 Cómo Ejecutar

### Opción 1: Servidor Local (Recomendado)

1. **Clonar o descargar** los archivos
2. **Abrir terminal** en la carpeta del proyecto
3. **Iniciar servidor**:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Python 2
   python -m SimpleHTTPServer 8000
   
   # Con Node.js (si tienes http-server)
   npx http-server
   ```
4. **Abrir navegador** en `http://localhost:8000`

### Opción 2: Archivo Directo

1. **Abrir** `index.html` directamente en el navegador
2. **Nota**: Algunas características pueden no funcionar correctamente debido a políticas CORS

## 💡 Uso de la Aplicación

### Marcar Progreso
- **Fases**: Click en "Marcar" para completar una fase
- **Proyectos**: Click en "Marcar como hecho" cuando completes un proyecto
- **Progreso**: Se guarda automáticamente cada 2 segundos

### Desbloqueo de Proyectos
- Los proyectos se desbloquean según los items completados
- Cada proyecto tiene un requisito `unlockAt` (items necesarios)
- Los proyectos bloqueados muestran un ícono de candado 🔒

### Guardado Manual
- Click en "💾 Guardar Progreso" para guardar manualmente
- El progreso se almacena en `localStorage` del navegador

### Expansión de Fases
- Click en el encabezado de cualquier fase para expandir/contraer
- Verás los detalles de aprendizaje, cursos y proyectos

## 🎨 Personalización

### Modificar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --blue: #3b82f6;
    --green: #10b981;
    /* ... otras variables */
}
```

### Agregar Nuevas Fases
1. Editar `data.js`
2. Agregar nuevo objeto al array `phases`
3. Seguir la estructura existente

### Modificar Proyectos
1. Editar el array `projects` dentro de cada fase
2. Ajustar `unlockAt` según dificultad
3. Personalizar `requirements` y `githubTips`

## 📱 Características Técnicas

### Optimizaciones Implementadas
- **CSS Variables** para fácil personalización
- **SVG inline** para iconos (sin dependencias externas)
- **Debounced autosave** para optimizar rendimiento
- **Responsive design** con CSS Grid y Flexbox
- **Component-based architecture** en JavaScript vanilla

### Almacenamiento
- **LocalStorage** para persistencia local
- **JSON structure** para datos de progreso
- **Autosave** cada 2 segundos con debounce
- **Manual save** disponible para usuarios

### Accesibilidad
- **ARIA labels** en botones interactivos
- **Keyboard navigation** soportada
- **Semantic HTML5** structure
- **Color contrast** optimizado

## 🔧 Troubleshooting

### Problemas Comunes

**Progreso no se guarda:**
- Verificar que el navegador permita localStorage
- Limpiar cache y recargar la página

**Iconos no aparecen:**
- Verificar conexión a internet para Google Fonts
- Los SVG inline deberían funcionar sin conexión

**Servidor local no inicia:**
- Asegurar que el puerto 8000 esté disponible
- Probar con otro puerto: `python -m http.server 3000`

### Desarrollo

**Para modificar los estilos:**
1. Editar `styles.css`
2. Recargar la página con Ctrl+F5 (hard refresh)

**Para modificar la lógica:**
1. Editar `app.js`
2. Recargar la página
3. Limpiar localStorage si es necesario

**Para modificar los datos:**
1. Editar `data.js`
2. Recargar la página
3. El progreso existente se mantendrá

## 📄 Licencia

Este proyecto es de código abierto y disponible para uso educativo y personal.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Algunas ideas:
- Nuevas fases de aprendizaje
- Mejoras en la UI/UX
- Funcionalidades adicionales
- Optimización de rendimiento

## 📞 Contacto

Si tienes preguntas o sugerencias, no dudes en contactar o abrir un issue.

---

**¡Feliz aprendizaje y construcción de tu carrera en desarrollo!** 🚀
