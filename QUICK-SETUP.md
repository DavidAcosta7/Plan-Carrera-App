# ⚡ SETUP RÁPIDO - Supabase

## 🔴 CRÍTICO PRIMERO: Desactivar Email Verification

Si estás viendo errores de registro, **PRIMERO haz esto:**

1. Ve a: https://app.supabase.com/project/illzdmhlkhnooykecqkv/auth/providers
2. Busca **"Email"** en la lista de providers
3. En la sección **"Email Confirmations"**, desactiva:
   - ☑️ Uncheck "Confirm email"
4. Haz clic en **"Save"**

⚠️ **IMPORTANTE:** Esto es solo para DESARROLLO. En producción, vuelve a activar email verification.

---

## Paso 1️⃣: Ejecutar supabase-setup.sql

1. Ve a tu proyecto Supabase: https://app.supabase.com/project/illzdmhlkhnooykecqkv/sql
2. Haz clic en "New query"
3. Dale nombre: **"01-Create-Tables"**
4. Abre este archivo: [supabase-setup.sql](supabase-setup.sql)
5. **Copia TODO el contenido** (desde el principio hasta el final)
6. **Pégalo en el SQL Editor** de Supabase
7. Haz clic en **"▶ Run"** (esquina superior derecha)
8. ✅ Deberías ver: **"Success. No rows returned."**

## Paso 2️⃣: Cargar datos iniciales (Fases, Proyectos, Cursos)

1. Haz clic en **"New query"** nuevamente
2. Dale nombre: **"02-Seed-Data"**
3. Abre este archivo: [supabase-seed-data.sql](supabase-seed-data.sql)
4. **Copia TODO el contenido** y **pégalo en Supabase**
5. Haz clic en **"▶ Run"**
6. ✅ Deberías ver: **"Success. X rows affected."** (donde X es un número)

## Paso 3️⃣: Crear usuario Admin

1. Ve a **Authentication** → **Users**: https://app.supabase.com/project/illzdmhlkhnooykecqkv/auth/users
2. Haz clic en **"Add user"**
3. Rellena:
   - Email: **admin@plancarrera.com**
   - Password: **123456**
   - ☑️ Marca "Auto confirm user"
4. Haz clic en **"Create user"**
5. **COPIA el UUID** que aparece (lo necesitarás en el próximo paso)

## Paso 4️⃣: Agregar el usuario a la tabla users

1. Ve de nuevo al **SQL Editor** de Supabase
2. Haz clic en **"New query"**
3. Dale nombre: **"03-Create-Admin"**
4. Pega esto (reemplaza `AQUI_VA_EL_UUID_DEL_USUARIO` con el UUID que copiaste):

```sql
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES (
    'AQUI_VA_EL_UUID_DEL_USUARIO',
    'admin@plancarrera.com',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

5. Haz clic en **"▶ Run"**
6. ✅ Deberías ver: **"Success. 1 row affected."**

## 🧪 Probar que funciona

1. Abre https://plan-carrera-app.vercel.app/
2. Abre la **Consola** (F12)
3. Busca estos logs:
   - ✅ "Supabase cliente cargado globalmente"
   - ✅ "URL: ✅ https://illzdmhlkhnooykecqkv..."
   - ✅ "Key: ✅ sb_publishable_..."

4. **Intenta registrarte** con un nuevo usuario (email y contraseña)
5. Espera 3 segundos
6. Ve a Supabase → **Authentication** → **Users**
7. ✅ Deberías ver tu nuevo usuario en la lista

## ⚠️ Importante

Las credenciales están **TEMPORALMENTE hardcodeadas** en `index.html` para testing.
**Cuando todo funcione**, deberás:
1. Ir a Vercel Dashboard
2. Settings del proyecto
3. Environment Variables
4. Agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
5. Remover credenciales de index.html

Pero por ahora, ¡adelante con el testing! 🚀

---

**¿Necesitas ayuda?** Revisa [DEBUGGING-USERS.md](DEBUGGING-USERS.md)
