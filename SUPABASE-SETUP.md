# 🚀 Guía de Configuración de Supabase - Plan Carrera Pro

## Prerequisitos
- ✅ Proyecto Supabase creado y conectado
- ✅ Credenciales disponibles (URL y keys)

---

## Paso 1: Crear las Tablas de Base de Datos

### Opción A: Usando Supabase SQL Editor (Recomendado)

1. **Abre el Editor SQL de Supabase:**
   - Ve a: https://app.supabase.com/project/_/sql
   - (Reemplaza `_` con tu ID de proyecto)

2. **Crea un nuevo query:**
   - Haz clic en "New query"
   - Dale un nombre: "01-Create-Tables"

3. **Copia y pega el contenido de `supabase-setup.sql`:**
   ```
   Este archivo contiene:
   - Tabla users (usuarios)
   - Tabla career_plans (planes de carrera)
   - Tabla phases (fases)
   - Tabla projects (proyectos)
   - Tabla user_phase_progress (progreso)
   - Tabla user_project_progress (progreso de proyectos)
   - Tabla courses (cursos)
   - Tabla conversations (conversaciones de chat)
   - Tabla messages (mensajes)
   - RLS Policies (seguridad a nivel de fila)
   - Índices para rendimiento
   ```

4. **Ejecuta el script:**
   - Haz clic en "▶ Run" (esquina superior derecha)
   - Deberías ver: "Success. No rows returned."

### Opción B: Usando CLI de Supabase

```bash
# Instala Supabase CLI (si no lo tienes)
npm install -g supabase

# Copia el contenido de supabase-setup.sql
cat supabase-setup.sql

# Pégalo directamente en el editor SQL de Supabase
```

---

## Paso 2: Cargar Datos Iniciales (Fases, Proyectos, Cursos)

1. **Abre un nuevo SQL query:**
   - Nombre: "02-Seed-Data"

2. **Copia y pega `supabase-seed-data.sql`:**
   - Este script inserta:
     - 5 Fases (SQL, Python, Integración, Aplicación Real, Especialización)
     - 15 Proyectos con dificultad gradual
     - Cursos recomendados para cada fase

3. **Ejecuta:**
   - Haz clic en "▶ Run"

---

## Paso 3: Crear Usuario Admin

### Opción A: Dashboard Supabase (Más Seguro)

1. **Ve a Authentication:**
   - https://app.supabase.com/project/_/auth/users

2. **Crea nuevo usuario:**
   - Haz clic en "Add user" o "Invite"
   - Email: `admin@plancarrera.com`
   - Password: `123456`
   - Marca "Auto confirm user"
   - Haz clic en "Create user"

3. **Copia el UUID del usuario:**
   - Se mostrará después de crear el usuario
   - Lo necesitarás para el siguiente paso

4. **Actualiza tabla users con rol admin:**
   - Abre un nuevo SQL query: "03-Create-Admin-User"
   - Pega esto (reemplaza `USER_ID` con el UUID copiado):
   ```sql
   INSERT INTO users (id, email, password_hash, name, role, has_plan, created_at, updated_at)
   VALUES (
       'USER_ID_AQUI',
       'admin@plancarrera.com',
       'managed_by_supabase_auth',
       'Admin User',
       'admin',
       false,
       NOW(),
       NOW()
   )
   ON CONFLICT (email) DO UPDATE SET role = 'admin';
   ```

### Opción B: Completamente desde SQL (Alternativo)

Si Supabase Auth está configurado correctamente:

```sql
-- Primero, crea el usuario en Auth
SELECT auth.admin_create_user(
    email := 'admin@plancarrera.com',
    password := '123456',
    email_confirm := true
);

-- Luego, obtén el UUID del usuario creado (aparecerá en el output)
-- Y ejecuta el INSERT anterior con ese UUID
```

---

## Paso 4: Verificar la Configuración

### Verificar Tablas Creadas:
1. Ve a: https://app.supabase.com/project/_/editor
2. Deberías ver:
   - ✅ users
   - ✅ career_plans
   - ✅ phases
   - ✅ projects
   - ✅ user_phase_progress
   - ✅ user_project_progress
   - ✅ courses
   - ✅ conversations
   - ✅ messages

### Verificar Datos:
1. Haz clic en "phases" → Deberías ver 5 fases
2. Haz clic en "projects" → Deberías ver 15 proyectos
3. Haz clic en "courses" → Deberías ver ~15 cursos

### Verificar Usuario Admin:
1. Ve a: https://app.supabase.com/project/_/auth/users
2. Deberías ver `admin@plancarrera.com` en la lista
3. Verifica que está confirmado (Confirmed = true)

---

## Paso 5: Configurar Variables de Entorno

Crea o actualiza el archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_KEY=tu-service-role-key-aqui

# Dónde obtener las keys:
# 1. Ve a https://app.supabase.com/project/_/settings/api
# 2. Copia:
#    - Project URL → VITE_SUPABASE_URL
#    - Anon public key → VITE_SUPABASE_ANON_KEY
#    - Service role secret → VITE_SUPABASE_SERVICE_KEY
```

**⚠️ IMPORTANTE:** 
- `.env.local` NUNCA debe commitarse a Git
- Usa `.env.example` para documentar variables

---

## Paso 6: Actualizar el Código de la App

Para usar Supabase en lugar de localStorage, actualiza:

### Opción A: Integración Completa
- Crea `utils/supabase.js` con cliente Supabase
- Actualiza `index.html` para usar Supabase Auth
- Actualiza rutas de login/registro
- Sincroniza progreso con Supabase

### Opción B: Híbrido (Rápido)
- Mantén localStorage para caché local
- Usa Supabase para persistencia remota
- Sincroniza cada 5 minutos

---

## 🧪 Probar la Configuración

### Test 1: Login
```
Email: admin@plancarrera.com
Password: 123456
```

### Test 2: Ver Datos
```
GET https://tu-proyecto.supabase.co/rest/v1/phases
Headers:
  Authorization: Bearer ANON_KEY
  apikey: ANON_KEY
```

### Test 3: Crear Progreso
```sql
INSERT INTO user_phase_progress (user_id, phase_id, completed)
VALUES ('USER_ID', 1, false);
```

---

## 📊 Estructura de Datos - Diagrama ER

```
users (1) ──────────── (many) career_plans
  │
  ├─── (many) user_phase_progress ──── (1) phases
  │                                       │
  │                                       └─── (many) projects
  │                                              │
  └─── (many) user_project_progress ──────────┘

  ├─── (many) conversations
  │              └─── (many) messages
```

---

## ⚠️ Problemas Comunes

### Error: "relation does not exist"
- Las tablas no se crearon correctamente
- Vuelve a ejecutar `supabase-setup.sql`
- Verifica que no haya errores en la consola

### Error: "new row violates row level security"
- Las políticas RLS no están correctas
- Usa Service Role Key para operaciones del backend
- Usa Anon Key solo para operaciones del cliente

### El usuario admin no aparece en Auth
- Verifica que ejecutaste todo el script
- Intenta crear manualmente desde el dashboard
- Confirma que el email está confirmado

### Las contraseñas no funcionan
- Supabase maneja las contraseñas
- No uses contraseña hasheada en la tabla users
- Deja el campo `password_hash` vacío (maneja Supabase)

---

## 🔒 Seguridad

✅ **Implementado:**
- Row Level Security (RLS) en todas las tablas
- Usuarios solo ven su propio contenido
- Públicos pueden ver fases y proyectos

⚠️ **Próximo Paso:**
- Implementar Supabase Auth en el frontend
- Usar JWT para autenticación
- Validar tokens en el backend

---

## 📚 Recursos

- [Docs Supabase](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/query-editor)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/guides/api)

---

## ✅ Checklist Final

- [ ] Tablas creadas
- [ ] Datos iniciales cargados
- [ ] Usuario admin creado
- [ ] Variables de entorno configuradas
- [ ] RLS habilitado y funcionando
- [ ] Puedo hacer login con admin@plancarrera.com / 123456
- [ ] Puedo ver fases y proyectos
- [ ] Puedo guardar progreso

¡Listo para integrar Supabase en tu app! 🎉
