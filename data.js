// Datos estáticos del Plan de Carrera
const phases = [
  {
    id: 1,
    title: "FASE 1: Dominio de SQL",
    duration: "6-8 semanas",
    icon: "database",
    color: "bg-blue-500",
    items: [
      "Fundamentos: SELECT, WHERE, ORDER BY, LIMIT",
      "Filtrado avanzado: LIKE, IN, BETWEEN",
      "Funciones agregadas: COUNT, SUM, AVG, MIN, MAX",
      "GROUP BY y HAVING",
      "JOINs: INNER, LEFT, RIGHT, FULL OUTER",
      "Subconsultas (subqueries)",
      "UNION, INTERSECT, EXCEPT",
      "INSERT, UPDATE, DELETE",
      "CREATE TABLE, ALTER TABLE, DROP",
      "Índices y constraints (PK, FK, UNIQUE)"
    ],
    projects: [
      {
        id: 'sql-easy',
        difficulty: 'easy',
        title: '📊 Sistema de Biblioteca',
        description: 'Base de datos simple con libros, autores y préstamos. Practica SELECT, WHERE, ORDER BY.',
        requirements: [
          'Crear tablas: books, authors, loans',
          'Insertar 20+ registros de ejemplo',
          'Consultas: buscar libros por autor',
          'Listar libros más prestados',
          'Filtrar por fecha de préstamo'
        ],
        githubTips: 'Incluye schema.sql con CREATE TABLE y queries.sql con 10+ consultas útiles',
        unlockAt: 4
      },
      {
        id: 'sql-medium',
        difficulty: 'medium',
        title: '🏪 Sistema de Ventas',
        description: 'E-commerce con clientes, productos, pedidos. Practica JOINs, agregaciones, subconsultas.',
        requirements: [
          'Tablas: customers, products, orders, order_items',
          'Relaciones con FK correctamente definidas',
          'Queries con múltiples JOINs',
          'Reporte de ventas por mes/producto',
          'Top 10 clientes por compras',
          'Productos sin stock usando subconsultas'
        ],
        githubTips: 'Crea sample_data.sql con datos realistas y analytics_queries.sql con reportes',
        unlockAt: 7
      },
      {
        id: 'sql-hard',
        difficulty: 'hard',
        title: '🏥 Sistema Hospitalario',
        description: 'BD compleja con pacientes, doctores, citas, historiales médicos. Normalización avanzada.',
        requirements: [
          'Diseño normalizado (3NF): 8+ tablas relacionadas',
          'Historial médico con versionamiento',
          'Queries complejas con subconsultas anidadas',
          'Vistas para reportes médicos',
          'Triggers para auditoría',
          'Índices para optimización'
        ],
        githubTips: 'Diagrama ERD, migrations.sql, stored_procedures.sql, y documentation.md explicando decisiones',
        unlockAt: 10
      }
    ],
    courses: [
      "SQL for Data Science (Coursera)",
      "Complete SQL Bootcamp (Udemy)",
      "SQLBolt (interactivo gratis)",
      "Mode Analytics SQL Tutorial"
    ],
    practice: "LeetCode Database (50+ problemas) + HackerRank SQL"
  },
  {
    id: 2,
    title: "FASE 2: Fundamentos Python",
    duration: "5-6 semanas",
    icon: "code",
    color: "bg-green-500",
    items: [
      "Sintaxis básica y tipos de datos",
      "Variables y operadores",
      "Estructuras de control: if/elif/else",
      "Loops: for, while, break, continue",
      "Listas, tuplas, sets, diccionarios",
      "Funciones y parámetros",
      "List comprehensions",
      "Manejo de archivos (CSV, JSON)",
      "Manejo de excepciones (try/except)",
      "Módulos y paquetes básicos"
    ],
    projects: [
      {
        id: 'py-easy',
        difficulty: 'easy',
        title: '📝 Gestor de Tareas CLI',
        description: 'To-do list en consola. Practica listas, funciones, archivos JSON.',
        requirements: [
          'Agregar, listar, completar tareas',
          'Guardar en archivo JSON',
          'Filtrar tareas por estado',
          'Menú interactivo',
          'Validación de entrada de usuario'
        ],
        githubTips: 'README con screenshots de uso, requirements.txt, y ejemplo de tasks.json',
        unlockAt: 4
      },
      {
        id: 'py-medium',
        difficulty: 'medium',
        title: '📊 Analizador de CSV',
        description: 'Procesa archivos CSV grandes. Practica manipulación de datos, diccionarios, comprehensions.',
        requirements: [
          'Leer CSV de ventas (1000+ filas)',
          'Calcular estadísticas: promedio, máximo, mínimo',
          'Agrupar por categoría/mes',
          'Detectar valores faltantes',
          'Exportar reportes en JSON',
          'Gráficos simples con matplotlib'
        ],
        githubTips: 'Incluye sample_data.csv, visualizaciones generadas, y documentación de funciones',
        unlockAt: 7
      },
      {
        id: 'py-hard',
        difficulty: 'hard',
        title: '🎮 Scraper Web de Noticias',
        description: 'Web scraper con BeautifulSoup. OOP, manejo de errores, APIs.',
        requirements: [
          'Scraper de 3+ sitios de noticias',
          'Clases para Article, Scraper',
          'Manejo robusto de errores HTTP',
          'Rate limiting',
          'Guardar en JSON y CSV',
          'Sistema de logs',
          'Tests unitarios básicos'
        ],
        githubTips: 'Estructura de proyecto profesional, .gitignore, virtual environment, y ética de scraping en README',
        unlockAt: 10
      }
    ],
    courses: [
      "Python para Todos (Coursera)",
      "100 Days of Code - Python (Udemy)",
      "Automate the Boring Stuff"
    ],
    practice: "HackerRank Python + ejercicios diarios Codewars"
  },
  {
    id: 3,
    title: "FASE 3: Integración Python + SQL",
    duration: "4-5 semanas",
    icon: "zap",
    color: "bg-purple-500",
    items: [
      "Conexión a bases de datos con sqlite3",
      "Conexión a PostgreSQL con psycopg2",
      "Conexión a MySQL con mysql-connector",
      "Ejecutar queries desde Python",
      "Manejo de cursores y resultados",
      "Parámetros y prevención SQL injection",
      "Transacciones y commits",
      "Context managers para conexiones",
      "Manejo de errores de BD",
      "Pandas + SQL: read_sql(), to_sql()"
    ],
    projects: [
      {
        id: 'int-easy',
        difficulty: 'easy',
        title: '📦 Inventario SQLite',
        description: 'CRUD simple con SQLite. Practica conexiones, INSERT, UPDATE, DELETE.',
        requirements: [
          'CLI para gestionar productos',
          'Operaciones CRUD completas',
          'Búsqueda por nombre/categoría',
          'Reporte de stock bajo',
          'Context managers para conexiones'
        ],
        githubTips: 'Script de inicialización de BD, capturas de uso, y manejo de errores ejemplar',
        unlockAt: 4
      },
      {
        id: 'int-medium',
        difficulty: 'medium',
        title: '💰 Sistema Bancario',
        description: 'Transacciones bancarias con PostgreSQL. Practica transacciones, seguridad.',
        requirements: [
          'Cuentas, usuarios, transacciones',
          'Transferencias con ACID',
          'Rollback en caso de error',
          'Historial de movimientos',
          'Prevención de SQL injection',
          'Encriptación de passwords (bcrypt)'
        ],
        githubTips: 'Docker compose para PostgreSQL, migrations, y documentación de seguridad',
        unlockAt: 7
      },
      {
        id: 'int-hard',
        difficulty: 'hard',
        title: '📈 ETL Data Pipeline',
        description: 'Pipeline de datos completo. Pandas, múltiples fuentes, transformaciones.',
        requirements: [
          'Extraer de CSV, API, PostgreSQL',
          'Transformar: limpiar, normalizar, agregar',
          'Cargar a data warehouse',
          'Logging detallado',
          'Manejo de errores y reintentos',
          'Programación con schedule/cron',
          'Pandas para transformaciones complejas'
        ],
        githubTips: 'Arquitectura documentada, config.yaml para settings, y ejemplo de ejecución end-to-end',
        unlockAt: 10
      }
    ],
    courses: [
      "Python Database Programming",
      "Working with Databases in Python"
    ],
    practice: "Migrar proyectos SQL anteriores a Python"
  },
  {
    id: 4,
    title: "FASE 4: Aplicación Real",
    duration: "6-8 semanas",
    icon: "trending-up",
    color: "bg-orange-500",
    items: [
      "Diseño de esquemas relacionales",
      "Normalización (1NF, 2NF, 3NF)",
      "SQLAlchemy ORM completo",
      "Modelos y relaciones",
      "Migraciones de base de datos",
      "CRUD completo con Python",
      "APIs REST con Flask/FastAPI",
      "Autenticación y gestión de usuarios",
      "ETL avanzado",
      "Testing de base de datos"
    ],
    projects: [
      {
        id: 'app-easy',
        difficulty: 'easy',
        title: '📝 Blog API REST',
        description: 'API simple con FastAPI. Practica endpoints, SQLAlchemy, validación.',
        requirements: [
          'Posts, usuarios, comentarios',
          'CRUD endpoints completos',
          'SQLAlchemy models y relationships',
          'Pydantic para validación',
          'Documentación automática (Swagger)',
          'Tests básicos con pytest'
        ],
        githubTips: 'Postman collection, railway/render deployment, y API docs screenshot',
        unlockAt: 4
      },
      {
        id: 'app-medium',
        difficulty: 'medium',
        title: '🛒 E-commerce Backend',
        description: 'Backend completo de tienda. Autenticación, carrito, pagos.',
        requirements: [
          'JWT authentication',
          'Roles: admin, customer',
          'Carrito de compras',
          'Órdenes y estados',
          'Búsqueda y filtros',
          'Paginación',
          'Alembic migrations',
          'Tests de integración'
        ],
        githubTips: 'Docker compose, CI/CD con GitHub Actions, y deployment instructions',
        unlockAt: 7
      },
      {
        id: 'app-hard',
        difficulty: 'hard',
        title: '🏢 CRM Empresarial',
        description: 'Sistema completo de gestión de clientes. Arquitectura profesional.',
        requirements: [
          'Módulos: clientes, ventas, tareas, reportes',
          'Arquitectura limpia (separación capas)',
          'Background jobs (Celery)',
          'Redis para caché',
          'Sistema de permisos granular',
          'Auditoría de cambios',
          'Reportes en PDF',
          'Dashboard con métricas',
          'Tests >80% coverage',
          'Documentación técnica completa'
        ],
        githubTips: 'Microservicios opcionales, monitoring, y case study en README',
        unlockAt: 10
      }
    ],
    courses: [
      "FastAPI Full Course",
      "SQLAlchemy Essential Training"
    ],
    practice: "Contribuir a proyectos Open Source"
  },
  {
    id: 5,
    title: "FASE 5: Nivel Experto",
    duration: "Continuo",
    icon: "award",
    color: "bg-red-500",
    items: [
      "Window Functions avanzadas",
      "CTEs recursivos",
      "Stored Procedures",
      "Optimización de queries",
      "EXPLAIN y análisis",
      "Índices estratégicos",
      "Pandas avanzado",
      "Visualización de datos",
      "NoSQL: MongoDB",
      "Data Warehousing"
    ],
    projects: [
      {
        id: 'exp-easy',
        difficulty: 'easy',
        title: '📊 Dashboard Analytics',
        description: 'Visualización de datos con Streamlit. Practica queries analíticas.',
        requirements: [
          'Conectar a PostgreSQL',
          'Métricas KPI en tiempo real',
          'Gráficos interactivos (Plotly)',
          'Filtros dinámicos',
          'Caché de queries',
          'Window functions para rankings'
        ],
        githubTips: 'Demo video/GIF, deployment en Streamlit Cloud, y sample database',
        unlockAt: 4
      },
      {
        id: 'exp-medium',
        difficulty: 'medium',
        title: '⚡ Query Optimizer Tool',
        description: 'Herramienta para optimizar queries SQL. Análisis de EXPLAIN.',
        requirements: [
          'Analizar EXPLAIN plans',
          'Sugerencias de índices',
          'Detección de N+1 queries',
          'Benchmarking automático',
          'Reescritura de queries',
          'Visualización de plans'
        ],
        githubTips: 'Ejemplos de antes/después, métricas de mejora, y algoritmos documentados',
        unlockAt: 7
      },
      {
        id: 'exp-hard',
        difficulty: 'hard',
        title: '🏗️ Data Warehouse',
        description: 'DW completo con ETL, star schema, BI.',
        requirements: [
          'Star schema con fact/dimension tables',
          'ETL orquestado (Airflow/Prefect)',
          'Slowly Changing Dimensions (SCD)',
          'Agregaciones pre-calculadas',
          'BI dashboards (Metabase/Superset)',
          'Data quality checks',
          'Particionamiento de tablas',
          'Documentación de modelo dimensional'
        ],
        githubTips: 'Arquitectura completa, benchmarks, y link a dashboard público',
        unlockAt: 10
      }
    ],
    courses: [
      "Advanced SQL for Data Analysis",
      "Data Engineering Fundamentals"
    ],
    practice: "Kaggle competitions + blogs técnicos"
  }
];

// Iconos SVG para cada fase
const icons = {
  database: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
  code: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  zap: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  'trending-up': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  award: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  'check-circle': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  github: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  'chevron-down': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  'chevron-up': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`
};
