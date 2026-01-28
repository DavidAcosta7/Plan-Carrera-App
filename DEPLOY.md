# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación **Plan Carrera Pro** en Vercel para que sea accesible desde internet.

## 📋 Requisitos Previos

1. **Cuenta de Vercel**: Si no tienes una, créala en [vercel.com](https://vercel.com) (es gratis)
2. **Git**: Asegúrate de tener Git instalado
3. **Repositorio Git**: Tu proyecto debe estar en GitHub, GitLab o Bitbucket

## 🔧 Opción 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) y crea un nuevo repositorio
2. Nombra tu repositorio (ej: `plan-carrera-pro`)
3. **NO** inicialices con README, .gitignore o licencia (ya los tienes)
4. Copia la URL del repositorio

### Paso 2: Inicializar Git en tu Proyecto

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: Plan Carrera Pro"

# Conectar con tu repositorio de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/plan-carrera-pro.git

# Subir el código
git branch -M main
git push -u origin main
```

### Paso 3: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **"Add New Project"** o **"Import Project"**
3. Selecciona **"Import Git Repository"**
4. Conecta tu cuenta de GitHub si es la primera vez
5. Selecciona tu repositorio `plan-carrera-pro`
6. Vercel detectará automáticamente la configuración:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (raíz)
   - **Build Command**: (dejar vacío)
   - **Output Directory**: `./` (raíz)
7. Haz clic en **"Deploy"**

### Paso 4: ¡Listo!

Vercel desplegará tu aplicación y te dará una URL como:
- `https://plan-carrera-pro.vercel.app`

También puedes configurar un dominio personalizado más adelante.

---

## 🔧 Opción 2: Despliegue con Vercel CLI (Línea de Comandos)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Iniciar Sesión

```bash
vercel login
```

### Paso 3: Desplegar

Desde la carpeta de tu proyecto:

```bash
# Despliegue de producción
vercel

# O para desplegar directamente a producción
vercel --prod
```

Sigue las instrucciones en pantalla:
- **Set up and deploy?** → `Y`
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → `N` (primera vez)
- **Project name?** → `plan-carrera-pro` (o el nombre que prefieras)
- **Directory?** → `./` (presiona Enter)
- **Override settings?** → `N`

### Paso 4: ¡Listo!

Tu aplicación estará disponible en la URL que Vercel te proporcione.

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

### Si usas GitHub:
1. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
2. Vercel detectará automáticamente los cambios y desplegará una nueva versión

### Si usas CLI:
```bash
vercel --prod
```

---

## ⚙️ Configuración Avanzada

### Variables de Entorno

Si necesitas variables de entorno (por ejemplo, para API keys):

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega tus variables:
   - `CLAUDE_API_KEY` (si la necesitas en el futuro)
   - Etc.

### Dominio Personalizado

1. Ve a Settings → Domains
2. Agrega tu dominio
3. Sigue las instrucciones de DNS que Vercel te proporciona

### Configuración de Build

El archivo `vercel.json` ya está configurado para:
- ✅ SPA routing (todas las rutas redirigen a index.html)
- ✅ Headers de seguridad
- ✅ Cache para archivos estáticos
- ✅ Content-Type correcto para archivos JS

---

## 🐛 Solución de Problemas

### Error: "Build Failed"
- Verifica que todos los archivos estén en el repositorio
- Asegúrate de que `index.html` esté en la raíz
- Revisa los logs de build en Vercel

### Las rutas no funcionan
- Verifica que `vercel.json` tenga la configuración de rewrites
- Asegúrate de que el archivo existe y está correcto

### Los estilos no se cargan
- Verifica que `styles.css` esté en la raíz del proyecto
- Revisa las rutas en `index.html` (deben ser relativas: `href="styles.css"`)

### Error 404 en rutas
- El archivo `vercel.json` ya tiene la configuración de rewrites para SPA
- Si persiste, verifica que el archivo esté correctamente formateado

---

## 📝 Notas Importantes

1. **LocalStorage**: Los datos se guardan en el navegador del usuario, no en el servidor
2. **Sin Backend**: Esta es una aplicación frontend estática, perfecta para Vercel
3. **Gratis**: El plan gratuito de Vercel es suficiente para proyectos pequeños/medianos
4. **HTTPS**: Vercel proporciona HTTPS automáticamente

---

## 🎉 ¡Felicitaciones!

Tu aplicación **Plan Carrera Pro** ahora está disponible en internet. Comparte la URL con quien quieras.

**URL de ejemplo**: `https://plan-carrera-pro.vercel.app`

---

¿Necesitas ayuda? Revisa la [documentación de Vercel](https://vercel.com/docs) o los logs de despliegue en tu dashboard.
