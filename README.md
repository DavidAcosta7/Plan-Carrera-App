# Plan de Carrera Pro

Una aplicación web interactiva para seguir tu plan de carrera en desarrollo de software, enfocada en SQL → Python → Integración → Aplicación Real.

## 🚀 Características

- **5 Fases de aprendizaje** con 15 proyectos prácticos
- **Sistema de progreso** con persistencia local
- **Desbloqueo progresivo** de proyectos según tu avance
- **Interfaz moderna** y responsive
- **Autosave automático** cada 2 segundos
- **Notificaciones** en tiempo real

## 📋 Estructura del Proyecto

```
PlanCarrera/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS optimizados
├── data.js             # Datos de las fases y proyectos
├── app.js              # Lógica de la aplicación
└── README.md           # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Almacenamiento**: LocalStorage (persistencia local)
- **Diseño**: CSS Grid, Flexbox, Variables CSS
- **Iconos**: SVG inline (optimizado)
- **Fuentes**: Google Fonts (Inter)

## 🎯 Fases del Plan

### FASE 1: Dominio de SQL (6-8 semanas)
- Fundamentos de SQL, JOINs, subconsultas
- Proyectos: Biblioteca, Sistema de Ventas, Sistema Hospitalario

### FASE 2: Fundamentos Python (5-6 semanas)
- Sintaxis, estructuras de control, manejo de archivos
- Proyectos: Gestor de Tareas CLI, Analizador de CSV, Scraper Web

### FASE 3: Integración Python + SQL (4-5 semanas)
- Conexión a bases de datos, transacciones
- Proyectos: Inventario SQLite, Sistema Bancario, ETL Pipeline

### FASE 4: Aplicación Real (6-8 semanas)
- APIs REST, autenticación, testing
- Proyectos: Blog API, E-commerce Backend, CRM Empresarial

### FASE 5: Nivel Experto (Continuo)
- Optimización avanzada, Data Warehousing
- Proyectos: Dashboard Analytics, Query Optimizer, Data Warehouse

## 🚀 Cómo Ejecutar

### Opción 1: Servidor Local (Recomendado)

1. **Clonar o descargar** los archivos
2. **Abrir terminal** en la carpeta del proyecto
3. **Iniciar servidor**:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Python 2
   python -m SimpleHTTPServer 8000
   
   # Con Node.js (si tienes http-server)
   npx http-server
   ```
4. **Abrir navegador** en `http://localhost:8000`

### Opción 2: Archivo Directo

1. **Abrir** `index.html` directamente en el navegador
2. **Nota**: Algunas características pueden no funcionar correctamente debido a políticas CORS

## 💡 Uso de la Aplicación

### Marcar Progreso
- **Fases**: Click en "Marcar" para completar una fase
- **Proyectos**: Click en "Marcar como hecho" cuando completes un proyecto
- **Progreso**: Se guarda automáticamente cada 2 segundos

### Desbloqueo de Proyectos
- Los proyectos se desbloquean según los items completados
- Cada proyecto tiene un requisito `unlockAt` (items necesarios)
- Los proyectos bloqueados muestran un ícono de candado 🔒

### Guardado Manual
- Click en "💾 Guardar Progreso" para guardar manualmente
- El progreso se almacena en `localStorage` del navegador

### Expansión de Fases
- Click en el encabezado de cualquier fase para expandir/contraer
- Verás los detalles de aprendizaje, cursos y proyectos

## 🎨 Personalización

### Modificar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --blue: #3b82f6;
    --green: #10b981;
    /* ... otras variables */
}
```

### Agregar Nuevas Fases
1. Editar `data.js`
2. Agregar nuevo objeto al array `phases`
3. Seguir la estructura existente

### Modificar Proyectos
1. Editar el array `projects` dentro de cada fase
2. Ajustar `unlockAt` según dificultad
3. Personalizar `requirements` y `githubTips`

## 📱 Características Técnicas

### Optimizaciones Implementadas
- **CSS Variables** para fácil personalización
- **SVG inline** para iconos (sin dependencias externas)
- **Debounced autosave** para optimizar rendimiento
- **Responsive design** con CSS Grid y Flexbox
- **Component-based architecture** en JavaScript vanilla

### Almacenamiento
- **LocalStorage** para persistencia local
- **JSON structure** para datos de progreso
- **Autosave** cada 2 segundos con debounce
- **Manual save** disponible para usuarios

### Accesibilidad
- **ARIA labels** en botones interactivos
- **Keyboard navigation** soportada
- **Semantic HTML5** structure
- **Color contrast** optimizado

## 🔧 Troubleshooting

### Problemas Comunes

**Progreso no se guarda:**
- Verificar que el navegador permita localStorage
- Limpiar cache y recargar la página

**Iconos no aparecen:**
- Verificar conexión a internet para Google Fonts
- Los SVG inline deberían funcionar sin conexión

**Servidor local no inicia:**
- Asegurar que el puerto 8000 esté disponible
- Probar con otro puerto: `python -m http.server 3000`

### Desarrollo

**Para modificar los estilos:**
1. Editar `styles.css`
2. Recargar la página con Ctrl+F5 (hard refresh)

**Para modificar la lógica:**
1. Editar `app.js`
2. Recargar la página
3. Limpiar localStorage si es necesario

**Para modificar los datos:**
1. Editar `data.js`
2. Recargar la página
3. El progreso existente se mantendrá

## 📄 Licencia

Este proyecto es de código abierto y disponible para uso educativo y personal.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Algunas ideas:
- Nuevas fases de aprendizaje
- Mejoras en la UI/UX
- Funcionalidades adicionales
- Optimización de rendimiento

## 📞 Contacto

Si tienes preguntas o sugerencias, no dudes en contactar o abrir un issue.

---

**¡Feliz aprendizaje y construcción de tu carrera en desarrollo!** 🚀
