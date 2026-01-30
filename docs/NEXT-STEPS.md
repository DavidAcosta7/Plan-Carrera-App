# Próximos Pasos - Plan Carrera App

## ✅ Lo que ya se completó

1. **Supabase Client Corregido** - Se eliminó el error `import.meta` y ahora `window.supabase` está disponible globalmente
2. **Deploy a Vercel** - Actualizado automáticamente en https://plan-carrera-app.vercel.app/
3. **Validación de sintaxis** - Código JavaScript verificado sin errores

## 🔴 BLOQUEADOR CRÍTICO: Configurar Variables de Entorno en Vercel

Antes de que el registro y login funcionen, **DEBES** agregar las variables de entorno en Vercel:

### Pasos:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto **Plan-Carrera-App**
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas dos variables:

```
VITE_SUPABASE_URL = tu_url_de_supabase
VITE_SUPABASE_ANON_KEY = tu_anon_key
```

Para obtener estos valores:
- Ve a tu proyecto en [Supabase](https://supabase.com)
- Click en **Settings** → **API**
- Copia:
  - **Project URL** → Pega en `VITE_SUPABASE_URL`
  - **Anon/Public key** → Pega en `VITE_SUPABASE_ANON_KEY`

5. Guarda los cambios
6. Redeploy en Vercel (puede hacerse manualmente o esperar un nuevo push)

## 📊 Configuración de Base de Datos

Una vez que tengas las variables configuradas:

1. **Crea las tablas en Supabase**:
   - Ve al SQL Editor de tu proyecto Supabase
   - Copia y ejecuta el contenido de [supabase-setup.sql](supabase-setup.sql)

2. **Agrega datos iniciales**:
   - Ejecuta el contenido de [supabase-seed-data.sql](supabase-seed-data.sql)

3. **Crea un usuario administrador**:
   - Ve a **Authentication** → **Users**
   - Click en **Add User**
   - Email: `admin@plancarrera.com`
   - Password: `123456` (o el que prefieras)

4. **Agrega el usuario a la tabla users**:
   - En el SQL Editor, ejecuta:
   ```sql
   INSERT INTO public.users (id, email, role)
   VALUES ('<uuid_del_usuario_creado>', 'admin@plancarrera.com', 'admin')
   ON CONFLICT(id) DO UPDATE SET role = 'admin';
   ```

## 🧪 Pruebas

Una vez todo esté configurado:

1. Abre https://plan-carrera-app.vercel.app/ en tu navegador
2. Abre la **Consola de Desarrollador** (F12)
3. Busca los logs:
   - ✅ "Supabase cliente cargado globalmente"
   - ✅ URL y Key deben mostrar "✅ Configurada"

4. Intenta registrarte con un nuevo usuario
5. Verifica que aparezca en Supabase → **Authentication** → **Users**

## 📝 Documentos de Referencia

- [ENV-SETUP.md](ENV-SETUP.md) - Guía completa de configuración
- [SUPABASE-SETUP.md](SUPABASE-SETUP.md) - Detalles de la base de datos
- [DEBUGGING-USERS.md](DEBUGGING-USERS.md) - Troubleshooting

## ⚠️ Importante

- **NO** es necesario instalar librerías Supabase (npm install @supabase/supabase-js)
- Estamos usando un cliente personalizado compatible con scripts HTML regulares
- Las variables se inyectan vía HTML, no desde módulos ES6

¡Avísame cuando hayas completado la configuración de Vercel para continuar! 🚀
