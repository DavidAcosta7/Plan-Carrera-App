#!/bin/bash
# Script para configurar Supabase
# Ejecutar desde la raíz del proyecto: bash setup-supabase.sh

set -e

echo "🔧 Plan Carrera Pro - Setup de Supabase"
echo "======================================"

# Verificar que se proporcionó la URL de Supabase
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL no está configurada"
    echo "Configura: export SUPABASE_URL=https://tu-proyecto.supabase.co"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_ANON_KEY no está configurada"
    echo "Configura: export SUPABASE_ANON_KEY=tu-key"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada"
    echo "Configura: export SUPABASE_SERVICE_ROLE_KEY=tu-key"
    exit 1
fi

echo "✅ Variables de Supabase configuradas"
echo ""

# Paso 1: Crear tablas
echo "1️⃣  Creando tablas en Supabase..."
echo "   - Abre la consola SQL de Supabase:"
echo "   - Ve a: https://app.supabase.com/project/_/sql"
echo "   - Copia y pega el contenido de: supabase-setup.sql"
echo "   - Ejecuta el script"
echo ""

# Paso 2: Seed data
echo "2️⃣  Poblando datos iniciales..."
echo "   - En la misma consola SQL, copia y pega: supabase-seed-data.sql"
echo "   - Ejecuta el script"
echo ""

# Paso 3: Crear usuario admin
echo "3️⃣  Creando usuario admin@plancarrera.com..."
echo ""
echo "   OPCIÓN A - Desde Supabase Dashboard (Recomendado):"
echo "   - Ve a: https://app.supabase.com/project/_/auth/users"
echo "   - Haz clic en 'Invite'"
echo "   - Email: admin@plancarrera.com"
echo "   - Genera contraseña temporal"
echo "   - Copia el link de invitación en el navegador"
echo ""
echo "   OPCIÓN B - Usando API (Automático):"

# Crear usuario usando API
ADMIN_EMAIL="admin@plancarrera.com"
ADMIN_PASSWORD="123456"

# Crear usuario en Auth
USER_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\",
    \"email_confirm\": true
  }")

USER_ID=$(echo $USER_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
    echo "   ⚠️  Error al crear usuario. Respuesta:"
    echo "   $USER_RESPONSE"
    echo ""
    echo "   Crea manualmente el usuario desde:"
    echo "   https://app.supabase.com/project/_/auth/users"
else
    echo "   ✅ Usuario creado: ${ADMIN_EMAIL}"
    echo "   ID: ${USER_ID}"
    
    # Insertar usuario en tabla users con role admin
    echo ""
    echo "   Ahora inserta en la tabla users usando SQL:"
    echo ""
    echo "   INSERT INTO users (id, email, password_hash, name, role) VALUES"
    echo "   ('${USER_ID}', '${ADMIN_EMAIL}', 'auth_by_supabase', 'Admin', 'admin');"
    echo ""
fi

echo "======================================"
echo "✅ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Configura variables de entorno en .env.local:"
echo "   VITE_SUPABASE_URL=${SUPABASE_URL}"
echo "   VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
echo ""
echo "2. Integra Supabase en la aplicación"
echo "3. Prueba login con: admin@plancarrera.com / 123456"
echo ""
