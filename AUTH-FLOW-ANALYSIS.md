# 📋 ANÁLISIS DE FLUJO DE AUTENTICACIÓN Y ONBOARDING

## 🔴 PROBLEMAS IDENTIFICADOS vs REGLAS DE PRODUCTO

### 1. **REGISTER → LOGIN → DASHBOARD** ❌
**Problema:** Después del registro, el usuario NO se logea automáticamente.
- El registro crea el usuario en Supabase
- El registro guarda en localStorage
- **PERO NO inicia sesión automáticamente**
- Usuario debe navegar manualmente a login

**Regla violada:**
```
✓ DEBE: Registro → Auto-login automático → Onboarding
✗ ACTUALMENTE: Registro → Guarda usuario → Usuario debe ir a login
```

**Ubicación:** `index.html` línea 587 - Navega a `/login` en lugar de auto-logear

---

### 2. **ONBOARDING disparado en cualquier momento** ❌
**Problema:** El onboarding se muestra si el usuario navega manualmente a `/onboarding`
- No está restringido SOLO a REGISTER
- El usuario puede acceder yendo directamente a la URL
- No hay validación de "origen" del navegación

**Regla violada:**
```
✓ DEBE: Onboarding SOLO después de REGISTER + Auto-login
✗ ACTUALMENTE: Onboarding disponible en cualquier momento
```

**Ubicación:** `pages/onboarding.html` línea 162 - Solo valida autenticación, no origen

---

### 3. **LOGIN → ONBOARDING** ❌
**Problema:** Si el usuario login y NO tiene `has_plan`, podría llegar a onboarding
- El onboarding redirige a dashboard si `has_plan=true`
- Pero si `has_plan=false` (primer login de un usuario viejo), se queda en onboarding
- **Esto es INCORRECTO**: Login nunca debe llanzar onboarding

**Regla violada:**
```
✓ DEBE: Login → SIEMPRE Dashboard
✗ ACTUALMENTE: Login → Dashboard si has_plan, sino ambiguo
```

**Ubicación:** `index.html` línea 656 - El login navega a dashboard pero la lógica es confusa

---

### 4. **Onboarding tiene 5 preguntas, necesita solo 4** ❌
**Problema:** El onboarding actual hace 5 preguntas, se especifican solo 4 obligatorias

**Reglas:**
```
✓ DEBE tener EXACTAMENTE 4 preguntas:
  1. ¿Qué te gustaría estudiar?
  2. ¿Cuánto tiempo tienes por día?
  3. ¿Cuál es tu objetivo?
  4. ¿En qué plazo quieres lograrlo?

✗ ACTUALMENTE tiene preguntas adicionales
```

**Ubicación:** `pages/onboarding.html` línea 100+ - Definición de preguntas

---

### 5. **Dashboard no tiene botón "Nuevo Plan"** ❌
**Problema:** No existe forma de crear planes adicionales
- Usuario puede tener múltiples planes
- No hay UI para crearlos después del onboarding inicial

**Regla violada:**
```
✓ DEBE: Dashboard con botón visible "Nuevo Plan Carrera"
✗ ACTUALMENTE: Sin botón para crear nuevos planes
```

**Ubicación:** `pages/dashboard.html` - No existe funcionalidad

---

### 6. **Planes no son múltiples** ❌
**Problema:** La estructura de datos asume UN solo plan por usuario
- Campo `user.plan` es singular
- Debería ser `user.plans` (array)
- No hay forma de guardar múltiples planes

**Regla violada:**
```
✓ DEBE: Soporte para múltiples planes por usuario
✗ ACTUALMENTE: Solo soporta un plan
```

**Ubicación:** `index.html` línea 188, `pages/onboarding.html` línea 478 - Estructura de datos

---

## ✅ LO QUE FUNCIONA CORRECTAMENTE

1. **Validación de autenticación** ✓ - Funciona correctamente en todas partes
2. **Integración con AIService** ✓ - Claude IA está bien integrado
3. **Generación de planes** ✓ - Los planes se generan correctamente con IA
4. **Persistencia en localStorage** ✓ - Los datos se guardan correctamente

---

## 🎯 PLAN DE REFACTORIZACIÓN

### FASE 1: Corregir el flujo REGISTER → AUTO-LOGIN → ONBOARDING

**Cambios necesarios:**

1. **index.html - `initRegisterForm`** (línea 483-600)
   - Después del registro exitoso en Supabase
   - **NUEVO**: Auto-logear al usuario
   - **NUEVO**: Marcar que viene de REGISTER (bandera `fromRegister`)
   - Navegar a `/onboarding` CON la bandera

2. **index.html - Router**
   - Pasar estado/parámetros de navegación
   - O usar sessionStorage para marcar origen

3. **pages/onboarding.html - initOnboarding** (línea 162)
   - Validar que viene de REGISTER (`sessionStorage.get('fromRegister')`)
   - Si NO viene de REGISTER, redirigir a dashboard
   - Limpiar la bandera al finalizar

---

### FASE 2: Corregir el flujo LOGIN → DASHBOARD (sin onboarding)

**Cambios necesarios:**

1. **index.html - `initLoginForm`** (línea 640-660)
   - Simplificar: Login → Always Dashboard
   - NO pasar a onboarding bajo ningún escenario
   - Limpiar sesionStorage de `fromRegister` si existe

---

### FASE 3: Ajustar preguntas de onboarding a 4 obligatorias

**Cambios necesarios:**

1. **pages/onboarding.html - questions array** (línea 100+)
   - Mantener EXACTAMENTE 4 preguntas
   - Remover preguntas adicionales
   - Asegurar campos: level/interests, timePerDay, goal, deadline

---

### FASE 4: Implementar múltiples planes y botón "Nuevo Plan"

**Cambios necesarios:**

1. **Estructura de datos**
   - Cambiar `user.plan` → `user.plans` (array)
   - Cambiar `user.has_plan` → `user.hasPlan` (boolean, aunque tenemos planes)
   - O mantener `has_plan` pero referirse al primer plan

2. **pages/dashboard.html**
   - Mostrar todos los planes del usuario
   - Agregar botón "Nuevo Plan Carrera" visible arriba
   - Al hacer clic: Lanzar el flujo de preguntas nuevamente
   - Guardar nuevo plan sin afectar anteriores

3. **pages/onboarding.html**
   - Reutilizable para crear planes adicionales
   - Detectar si es first-time (REGISTER) o nuevo plan (DASHBOARD button)
   - Al finalizar: Redirigir a dashboard (en ambos casos)

---

## 🔧 IMPLEMENTACIÓN DETALLADA

### 1. Sistema de Origen de Navegación

```javascript
// sessionStorage flags
sessionStorage.set('fromRegister', 'true')  // Solo después de REGISTER
sessionStorage.set('creatingNewPlan', 'true')  // Desde botón "Nuevo Plan"

// Limpiar después de usar
sessionStorage.removeItem('fromRegister')
sessionStorage.removeItem('creatingNewPlan')
```

### 2. Auto-login después de REGISTER

```javascript
// En initRegisterForm, después de créar usuario:
const authResult = await window.supabase.signUp(email, password);

// NUEVO: Auto-logear
const loginResult = await window.supabase.signIn(email, password);

// Guardar sesión
window.auth.loginUser(loginResult.user);

// Marcar origen
sessionStorage.set('fromRegister', 'true');

// Navegar a onboarding
window.router.navigate('/onboarding');
```

### 3. Validación en Onboarding

```javascript
function initOnboarding() {
    // Validar origen
    const fromRegister = sessionStorage.get('fromRegister');
    const creatingNewPlan = sessionStorage.get('creatingNewPlan');
    
    if (!fromRegister && !creatingNewPlan) {
        // No viene de REGISTER ni del botón "Nuevo Plan"
        router.navigate('/dashboard');
        return;
    }
    
    // Continuar con onboarding...
}
```

### 4. Login → Dashboard

```javascript
function initLoginForm() {
    form.addEventListener('submit', async (e) => {
        // Validar credenciales
        const result = await supabase.signIn(email, password);
        
        if (result.success) {
            // Guardar sesión
            window.auth.loginUser(result.user);
            
            // SIEMPRE al dashboard
            window.router.navigate('/dashboard');
            
            // Limpiar banderas
            sessionStorage.removeItem('fromRegister');
            sessionStorage.removeItem('creatingNewPlan');
        }
    });
}
```

### 5. Dashboard - Botón "Nuevo Plan"

```javascript
// En pages/dashboard.html
function createNewPlan() {
    sessionStorage.set('creatingNewPlan', 'true');
    router.navigate('/onboarding');
}

// Renderizar en UI:
<button class="btn-primary" onclick="createNewPlan()">
    + Nuevo Plan Carrera
</button>
```

### 6. Estructura de Planes Múltiples

```javascript
// ANTES
user = {
    id: '123',
    email: 'user@mail.com',
    has_plan: true,
    plan: { ...singlePlan }
}

// DESPUÉS
user = {
    id: '123',
    email: 'user@mail.com',
    plans: [
        { id: 'plan-1', title: '...', phases: [...] },
        { id: 'plan-2', title: '...', phases: [...] }
    ]
}

// En localStorage:
user.plan = user.plans[0];  // Para compatibilidad con código existente
```

---

## 📊 MATRIZ DE CAMBIOS

| Componente | Línea | Cambio | Prioridad |
|-----------|-------|--------|-----------|
| `index.html` | 587 | Agregar auto-login después de registro | 🔴 CRÍTICA |
| `pages/onboarding.html` | 162 | Validar origen (fromRegister) | 🔴 CRÍTICA |
| `pages/onboarding.html` | 100+ | Reducir a 4 preguntas obligatorias | 🟠 ALTA |
| `pages/dashboard.html` | - | Agregar botón "Nuevo Plan" | 🟠 ALTA |
| `index.html` | 656 | Limpiar lógica LOGIN → DASHBOARD | 🟡 MEDIA |
| Estructura user | - | Soportar múltiples planes | 🟡 MEDIA |

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de cada cambio, validar:

- [ ] REGISTER crea usuario + auto-logea + va a onboarding
- [ ] LOGIN valida credenciales + va a dashboard (sin onboarding)
- [ ] Onboarding SOLO accesible desde REGISTER o botón "Nuevo Plan"
- [ ] Onboarding tiene EXACTAMENTE 4 preguntas obligatorias
- [ ] Onboarding guarda respuestas en BD
- [ ] Onboarding genera plan con IA
- [ ] Onboarding redirige a dashboard al finalizar
- [ ] Dashboard muestra todos los planes del usuario
- [ ] Dashboard tiene botón visible "Nuevo Plan"
- [ ] Botón "Nuevo Plan" lanza onboarding nuevamente
- [ ] Nuevo plan se guarda sin afectar planes anteriores
- [ ] sessionStorage se limpia apropiadamente

---

**Status:** Lista para implementación  
**Criticidad:** Alta - Flujo de usuario fundamental  
**Estimación:** 4-5 horas
