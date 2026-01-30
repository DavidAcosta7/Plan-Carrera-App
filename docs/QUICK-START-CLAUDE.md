# 🚀 Guía Rápida - Implementación Claude AI

## En 5 Minutos: Empezar Proyecto

### Paso 1: Obtener API Keys

#### Claude API
1. Ve a https://console.anthropic.com/
2. Sign in con tu cuenta
3. Ve a Settings → API Keys
4. Copia una key existente o crea una nueva
5. Formato: `sk-ant-xxxxxxxxxxxxx`

#### Supabase
1. Ve a https://app.supabase.com/
2. Crea nuevo proyecto o selecciona uno existente
3. Ve a Settings → API
4. Copia:
   - **Project URL** (ej: https://xxxxx.supabase.co)
   - **Anon/Public Key** (ej: sb_publishable_xxxxx)

### Paso 2: Configurar Variables de Entorno

```bash
# En la raíz del proyecto, crea .env.local
cat > .env.local << EOF
VITE_ANTHROPIC_API_KEY=sk-ant-tu-key-aqui
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tu-key-aqui
EOF
```

### Paso 3: Ejecutar Schema SQL en Supabase

1. Ve a Supabase Dashboard → SQL Editor
2. Crea nueva consulta
3. Copia todo el contenido de `supabase-schema-ai-plans.sql`
4. Pégalo en el editor
5. Click "Run"
6. Espera a que complete (verde = éxito)

### Paso 4: Iniciar la Aplicación

```bash
# Instala dependencias (si es necesario)
npm install

# Inicia dev server
npm run dev

# Abre http://localhost:5173
```

### Paso 5: Prueba el Flujo Completo

1. Click "Crear Cuenta"
2. Registra un usuario (ej: test@example.com / password123)
3. Sistema te redirige a onboarding automáticamente
4. Responde las 5 preguntas
5. Click "Generar Mi Plan"
6. Espera a que Claude genere (20-30 segundos)
7. ¡Tu plan aparecerá en el dashboard!

---

## ⚠️ Errores Comunes

### "Claude API no está configurada"
```javascript
// Solución: Verifica que la key está en .env.local
console.log(aiService.isConfigured); // Debe ser true

// Alternativa: Configura manualmente
aiService.setApiKey("sk-ant-...");
```

### "Supabase no está configurado"
```javascript
// Solución: Verifica variables de entorno
console.log(window.SUPABASE_CONFIG);

// Verifica en browser console (F12):
// Debe mostrar {url: "...", anonKey: "..."}
```

### "Error al generar plan"
- Verifica que todas las preguntas están respondidas
- Aumenta timeout en AIService (máximo 60 segundos)
- Revisa la consola del navegador (F12)
- Verifica que el modelo Claude esté disponible

### "Error 401 en Supabase"
- Verifica que la Anon Key es correcta (no confundir con Service Role)
- La key debe empezar con `sb_publishable_`
- Verifica que el proyecto Supabase está activo

---

## 🔍 Debugging

### Ver logs en navegador (F12)
```javascript
// Console debería mostrar logs como:
✅ Claude AI Service inicializado
✅ Supabase cliente inicializado correctamente
📝 Variables de Supabase inyectadas en window.SUPABASE_CONFIG
📝 Enviando respuestas a Claude IA:
✅ Plan generado por IA:
✅ Plan guardado en BD:
```

### Verificar que AIService funciona
```javascript
// En console (F12):
aiService.isConfigured // true si está configurado
aiService.apiKey // debe mostrar la key

// Para probar:
await aiService.callClaude("Hola, ¿eres Claude?")
```

### Verificar que Supabase funciona
```javascript
// En console (F12):
supabaseClient.isConfigured // true
supabaseClient.url // URL del proyecto
supabaseClient.anonKey // anon key

// Para probar:
await supabaseClient.from('career_plans').select('COUNT')
```

---

## 📊 Flujo de Datos

```
Usuario
  ↓
Onboarding (5 preguntas)
  ↓
AIService.generateCareerPlan(userAnswers)
  ↓
Claude API (genera JSON)
  ↓
PlanService.savePlan(plan, userAnswers)
  ↓
Supabase (career_plans table)
  ↓
Dashboard muestra planes
```

---

## 🎯 Qué Hace Cada Archivo

| Archivo | Qué Hace |
|---------|----------|
| `utils/ai-service.js` | Comunica con Claude API |
| `utils/plan-service.js` | Guarda/obtiene planes de Supabase |
| `utils/auth-service.js` | Detecta primer login, marca onboarding |
| `pages/onboarding.html` | Formulario de 5 preguntas → Genera plan |
| `pages/dashboard.html` | Lista de planes del usuario |
| `supabase-schema-ai-plans.sql` | Estructura de BD (tablas, índices) |

---

## 💡 Troubleshooting Avanzado

### Plan no se guarda en Supabase
```sql
-- Verifica en Supabase SQL Editor:
SELECT COUNT(*) FROM career_plans;
-- Debe mostrar > 0 después de generar plan

-- Verifica que RLS está bien:
SELECT * FROM career_plans WHERE user_id = 'tu-user-id';
```

### Onboarding se queda en "Cargando"
1. Abre DevTools (F12)
2. Ve a Network
3. Busca request a `https://api.anthropic.com/v1/messages`
4. Verifica status (200 = éxito, 401 = key inválida, 429 = rate limit)
5. Revisa response en "Response" tab

### Error 403 en Supabase
- Verifica que RLS policies están activas
- Revisa que `auth.uid()` no es null
- Confirma que user_id coincide entre tablas

---

## 🔐 Seguridad

**IMPORTANTE:**
- ❌ NUNCA commitees `.env.local` a git
- ❌ NUNCA copies API keys en código
- ✅ Siempre usa variables de entorno
- ✅ Para Vercel, usa Settings → Environment Variables

**Para Vercel:**
```bash
# Agrega variables sin crear .env.local
vercel env add VITE_ANTHROPIC_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Verifica con:
vercel env list
```

---

## 📈 Próximos Pasos

Después de que funcione el MVP:

1. **Personalización**
   - [ ] Cambiar colores del tema
   - [ ] Agregar logo
   - [ ] Cambiar textos en páginas

2. **Features**
   - [ ] Editar planes existentes
   - [ ] Chat con IA durante aprendizaje
   - [ ] Feedback en proyectos
   - [ ] Exportar PDF

3. **Optimización**
   - [ ] Caché de planes
   - [ ] Lazy loading de componentes
   - [ ] Compresión de imágenes
   - [ ] Analytics

4. **Escalabilidad**
   - [ ] Database replication
   - [ ] CDN para assets
   - [ ] Cron jobs para limpieza
   - [ ] Monitoring y alertas

---

## 📞 Recursos

- **Claude API Docs**: https://docs.anthropic.com/
- **Supabase Docs**: https://supabase.com/docs
- **Discord Claude**: https://discord.gg/claude
- **GitHub Issues**: Reporta bugs en el repositorio

---

**Versión**: 1.0.0
**Última actualización**: 29 de enero de 2026
**Duración estimada setup**: 15-20 minutos
