# 📋 Checklist Rápido - Setup de Supabase

## 🔧 Lo que hemos creado para ti:

### 1. **supabase-setup.sql** (681 líneas)
   - 9 tablas completas
   - Relaciones y constraints
   - Row Level Security (RLS)
   - Índices para optimización

### 2. **supabase-seed-data.sql** (150 líneas)
   - 5 fases de aprendizaje
   - 15 proyectos (easy, medium, hard)
   - 15+ cursos recomendados
   - Datos listos para usar

### 3. **SUPABASE-SETUP.md** (Guía completa)
   - Instrucciones paso a paso
   - Screenshots incluidas
   - Solución de problemas
   - Ejemplos de queries

---

## ✅ Próximos pasos (3 pasos simples):

### PASO 1: Crear Tablas ⏱️ 5 min
```
1. Abre: https://app.supabase.com/project/_/sql
2. Nuevo query → "01-Create-Tables"
3. Copia contenido de: supabase-setup.sql
4. Haz clic en ▶ Run
5. ✅ Listo
```

### PASO 2: Cargar Datos ⏱️ 2 min
```
1. Nuevo query → "02-Seed-Data"
2. Copia contenido de: supabase-seed-data.sql
3. Haz clic en ▶ Run
4. ✅ Listo
```

### PASO 3: Crear Usuario Admin ⏱️ 3 min
```
1. Ve a: https://app.supabase.com/project/_/auth/users
2. "Add user" → admin@plancarrera.com / 123456
3. Copia el UUID del usuario
4. Nuevo SQL query → "03-Create-Admin-User"
5. Ejecuta:
   
   INSERT INTO users (id, email, password_hash, name, role)
   VALUES (
       'PASTE_UUID_HERE',
       'admin@plancarrera.com',
       'managed_by_supabase_auth',
       'Admin User',
       'admin'
   );

6. ✅ Listo
```

---

## 📊 Verificación Rápida

Después de los 3 pasos, en Supabase deberías ver:

```
✅ Auth → Users
   └─ admin@plancarrera.com (Confirmed)

✅ Database → Tables
   ├─ users
   ├─ career_plans
   ├─ phases (5 fases)
   ├─ projects (15 proyectos)
   ├─ user_phase_progress
   ├─ user_project_progress
   ├─ courses (~15 cursos)
   ├─ conversations
   └─ messages

✅ Puedes hacer login con:
   Email: admin@plancarrera.com
   Password: 123456
```

---

## 🔐 Variables de Entorno

Después, copia estas keys a `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
VITE_SUPABASE_SERVICE_KEY=eyJxx...
```

📍 Dónde copiarlas:
- https://app.supabase.com/project/_/settings/api

---

## 🎯 ¿Qué hace cada SQL?

### supabase-setup.sql
- **users**: Tabla de usuarios con rol (admin/user)
- **career_plans**: Planes personalizados por usuario
- **phases**: 5 fases del programa (SQL, Python, etc.)
- **projects**: 15 proyectos con dificultad
- **user_phase_progress**: Qué fases completó cada usuario
- **user_project_progress**: Qué proyectos completó cada usuario
- **courses**: Cursos recomendados por fase
- **conversations**: Chat con IA (futuro)
- **messages**: Mensajes de conversación

### supabase-seed-data.sql
- Inserta automáticamente todas las fases, proyectos y cursos
- Datos consistentes con la lógica de la app
- Pronto listos para la interfaz

---

## 🚀 Después del Setup

Una vez completado, podrás:

1. **Login** con usuario admin
2. **Ver** todas las fases y proyectos
3. **Guardar** progreso en base de datos
4. **Sincronizar** progreso entre dispositivos
5. **Usar** data real en lugar de localStorage

---

## 📞 Si algo sale mal

### Error en supabase-setup.sql
- Copia el mensaje de error completo
- Busca línea donde falló
- Verifica sintaxis SQL

### Usuario admin no aparece
- Verifica que email esté confirmado en Auth
- Copia UUID correctamente
- Ejecuta INSERT nuevamente

### No puedo conectar
- Verifica URL y keys de .env.local
- ANON_KEY para cliente
- SERVICE_KEY para servidor

---

## ⏭️ Siguientes Pasos

Después del setup de Supabase:

1. Integrar cliente Supabase en JavaScript
2. Conectar login/registro a Auth
3. Guardar progreso automáticamente
4. Implementar chat con Claude + Supabase

---

**¿Listo? 🚀 Comienza con PASO 1**

Abre: https://app.supabase.com/project/_/sql
