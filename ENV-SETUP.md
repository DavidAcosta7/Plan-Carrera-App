# ⚙️ Configuración de Variables de Entorno

## 1. Obtener las credenciales de Supabase

### Opción A: Desde el Dashboard de Supabase

1. Ve a: https://app.supabase.com/project/_/settings/api
   - (Reemplaza `_` con tu ID de proyecto)

2. Busca estas claves:
   - **Project URL** → Copia la URL completa
   - **Anon public key** → Copia la clave pública
   - **Service role secret** → Copia la clave de rol de servicio (solo para backend)

### Opción B: Desde el dashboard de Vercel (Conectado)

1. Ve a: https://vercel.com/dashboard
2. Tu proyecto → Settings → Environment Variables
3. Deberías ver las variables ya configuradas por Supabase

---

## 2. Crear archivo `.env.local`

### Windows / macOS / Linux

Crea un archivo llamado `.env.local` en la raíz del proyecto:

```bash
touch .env.local
```

Abre el archivo y pega:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Claude API Key
VITE_CLAUDE_API_KEY=sk-ant-...

# App Configuration
VITE_APP_NAME=Plan Carrera Pro
VITE_APP_URL=https://plan-carrera-app.vercel.app
```

---

## 3. Reemplazar los valores

### Paso 1: URL de Supabase
```
De: https://your-project.supabase.co
A: https://xxxxxxxxxxxxx.supabase.co
   (tu URL real)
```

### Paso 2: Anon Key
```
De: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
A: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   (tu anon key real, copiada del dashboard)
```

---

## 4. Verificar que funciona

### En el Terminal:

```bash
# Asegúrate de que el archivo existe
ls -la .env.local

# Verifica que contiene los datos
cat .env.local
```

### En la App:

1. Abre: http://localhost:5173 (si corres local)
2. O: https://plan-carrera-app.vercel.app (en producción)
3. Ve a: Registro
4. Crea una cuenta nueva
5. Verifica que en Supabase → Auth → Users aparece el nuevo usuario

---

## 5. Estructura de Variables

| Variable | Dónde Copiarla | Tipo | Necesario |
|----------|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL | URL | ✅ Sí |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → Anon public key | String | ✅ Sí |
| `VITE_CLAUDE_API_KEY` | Claude Console | String | ⭕ Opcional |
| `VITE_APP_NAME` | Cualquier nombre | String | ⭕ Opcional |
| `VITE_APP_URL` | Tu dominio | URL | ⭕ Opcional |

---

## 6. En Producción (Vercel)

### Si está conectado automáticamente:
✅ Las variables ya están en Vercel
✅ No necesitas hacer nada más

### Si no está conectado:
1. Ve a: https://vercel.com/dashboard
2. Tu proyecto → Settings → Environment Variables
3. Agrega:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co`
4. Repite para `VITE_SUPABASE_ANON_KEY`
5. Deploy nuevamente

---

## 7. Troubleshooting

### Error: "Cannot read properties of undefined"
- **Problema**: Las variables de entorno no se cargaron
- **Solución**: Reinicia el servidor local (`npm run dev`)

### Error: "Invalid API key"
- **Problema**: El anon key está mal copiado
- **Solución**: Copia nuevamente del dashboard Supabase

### Error: "CORS"
- **Problema**: Supabase está bloqueando la solicitud
- **Solución**: Verifica que la URL sea correcta sin barras extras

### El usuario se registra pero no aparece en Supabase
- **Problema**: El anon key no tiene permisos
- **Solución**: Verifica en Supabase → Database → users → RLS policies

---

## 8. Seguridad

⚠️ **IMPORTANTE:**

```
❌ NUNCA hagas commit de .env.local
✅ Usa .env.example para documentar variables
✅ El .gitignore ya excluye .env.local
✅ Las credenciales están seguras en Vercel
```

Verifica:
```bash
git status
# No debería aparecer .env.local
```

---

## ✅ Checklist

- [ ] Copié VITE_SUPABASE_URL
- [ ] Copié VITE_SUPABASE_ANON_KEY
- [ ] Creé .env.local
- [ ] Pegué las variables
- [ ] Reinicié el servidor
- [ ] Puedo registrar usuarios
- [ ] Los usuarios aparecen en Supabase Auth
- [ ] Los usuarios aparecen en tabla users

¡Listo! 🎉
