# 🔍 Debugging - Usuarios no aparecen en Supabase

## Síntomas
- ✅ El registro se completa sin errores
- ❌ El usuario NO aparece en Supabase Auth
- ❌ El usuario NO aparece en tabla users

---

## 🔧 Cómo Debuggear

### Paso 1: Abre DevTools del Navegador
1. Presiona: **F12** (o Cmd+Option+I en Mac)
2. Ve a la pestaña: **Console**
3. Deberías ver mensajes como:
   ```
   ✅ Supabase está configurado
   📝 Registrando en Supabase Auth...
   ✅ Usuario creado en Auth con ID: xxx
   📤 Insertando en tabla users...
   ✅ Usuario insertado en tabla users
   ```

### Paso 2: Lee los mensajes de error
Si hay error, verás algo como:
```
❌ Supabase no está configurado
❌ Error en Supabase Auth: Invalid API key
❌ Error al insertar en tabla users: relation "users" does not exist
```

---

## 🆘 Soluciones por Tipo de Error

### Error 1: "Supabase no está configurado"
**Causa:** Variables de entorno no configuradas

**Solución:**
1. Crea archivo `.env.local` en la raíz:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
2. Obtén valores de: https://app.supabase.com/project/_/settings/api
3. **Reinicia el servidor**: Ctrl+C y luego `npm run dev`
4. Actualiza la página del navegador (Ctrl+R)

### Error 2: "Invalid API key"
**Causa:** El anon key está mal copiado o no tiene permisos

**Solución:**
1. Ve a: https://app.supabase.com/project/_/settings/api
2. Copia nuevamente "Anon public key"
3. Reemplaza en `.env.local`
4. Reinicia servidor y navegador

### Error 3: "relation 'users' does not exist"
**Causa:** Las tablas no fueron creadas en Supabase

**Solución:**
1. Ve a Supabase → SQL Editor
2. Ejecuta `supabase-setup.sql` completo
3. Ejecuta `supabase-seed-data.sql`
4. Verifica en Database → Tables (debe aparecer "users")

### Error 4: "new row violates row level security"
**Causa:** El anon key no tiene permisos de escritura

**Solución:**
1. Ve a Supabase → Auth → Policies (en tabla users)
2. Verifica que hay política:
   ```
   For INSERT: Users can insert own plans
   ```
3. Si no existe, crea la política
4. Prueba nuevamente

### Error 5: El usuario aparece en Auth pero NO en tabla users
**Causa:** El INSERT en tabla users falló silenciosamente

**Solución:**
1. Ve a Supabase → Auth → Users
2. Copia el UUID del usuario
3. Ve a Supabase → SQL Editor
4. Ejecuta:
   ```sql
   INSERT INTO users (id, email, password_hash, name, role)
   VALUES (
       'PASTE_UUID_HERE',
       'email@example.com',
       'managed_by_supabase_auth',
       'User Name',
       'user'
   );
   ```
5. Si hay error, ve la sección de RLS Policies abajo

---

## 🔐 Verificar RLS Policies

### Paso 1: Ve a Supabase Dashboard
- https://app.supabase.com/project/_/editor
- Selecciona tabla "users"

### Paso 2: Haz clic en "Policies" o "RLS"

### Paso 3: Verifica que exista esta política:
```
Policy name: Users can insert own profiles
For: INSERT
USING / WITH CHECK:
  auth.uid() = id
```

Si NO existe, créala manualmente:

1. Haz clic en "New Policy"
2. Selecciona: INSERT
3. Llena con:
   ```
   Policy name: users_insert_own
   USING expression: auth.uid()::text = id::text
   WITH CHECK: auth.uid()::text = id::text
   ```
4. Haz clic en "Review" → "Save policy"

---

## 📊 Checklist de Debugging

- [ ] Abrí DevTools (F12)
- [ ] Veo mensajes en Console (no errores)
- [ ] Tengo `.env.local` creado
- [ ] VITE_SUPABASE_URL está configurado
- [ ] VITE_SUPABASE_ANON_KEY está configurado
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Actualicé el navegador (Ctrl+R)
- [ ] Las tablas existen en Supabase
- [ ] Ejecuté `supabase-setup.sql`
- [ ] RLS Policies están habilitadas
- [ ] Intento registrar desde cero

---

## 🧪 Test Manual

### Prueba 1: Verificar que Supabase está configurado
En DevTools (Console), escribe:
```javascript
console.log('Supabase URL:', supabase.url);
console.log('Supabase Key:', supabase.anonKey.substring(0, 20) + '...');
console.log('¿Configurado?', supabase.isConfigured);
```

Deberías ver:
```
Supabase URL: https://xxxxx.supabase.co
Supabase Key: eyJhbGciOiJIUzI1NiI...
¿Configurado? true
```

### Prueba 2: Registrar manualmente
En DevTools (Console):
```javascript
await supabase.signUp('test@example.com', 'password123');
```

Deberías ver en Console:
```
✅ Usuario registrado en Auth: uuid-aqui
```

### Prueba 3: Ver Auth en Supabase
1. Ve a: https://app.supabase.com/project/_/auth/users
2. Busca `test@example.com`
3. Debe estar en la lista

### Prueba 4: Ver tabla users
1. Ve a: https://app.supabase.com/project/_/editor
2. Selecciona tabla "users"
3. Si el usuario fue insertado, debe aparecer aquí

---

## 📞 Si nada funciona

**Recopila esta información:**

1. **Desde DevTools Console:**
   - Copia TODO el output de errores
   - Ejecuta: `console.log(supabase.isConfigured)`
   - Ejecuta: `console.log(supabase.url)`

2. **Desde Supabase Dashboard:**
   - ¿Existen las tablas? (Database → Tables)
   - ¿Existe tabla users? (sí/no)
   - ¿Hay usuarios en Auth? (Auth → Users)

3. **Desde `.env.local`:**
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co (✅ completo)
   VITE_SUPABASE_ANON_KEY=eyJ... (✅ no vacío)
   ```

4. **Intenta registrar de nuevo:**
   - Email: prueba@test.com
   - Nombre: Test User
   - Contraseña: test123456
   - Copia TODO lo que aparece en Console

---

## 🚀 Checklist Final

Después de debuggear, deberías poder:

- [ ] Ver mensajes de éxito en Console
- [ ] El usuario aparece en Supabase Auth
- [ ] El usuario aparece en tabla users
- [ ] Poder hacer login con esa cuenta
- [ ] Ver progreso guardado en BD

¡Adelante! 🎉
