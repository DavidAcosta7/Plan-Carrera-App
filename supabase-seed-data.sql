-- Script para insertar datos iniciales de fases y proyectos
-- Ejecutar DESPUÉS de supabase-setup.sql

-- Insertar Fases
INSERT INTO phases (id, title, duration, icon, color, display_order) VALUES
(1, 'FASE 1: Dominio de SQL', '6-8 semanas', 'database', 'bg-blue-500', 1),
(2, 'FASE 2: Fundamentos Python', '5-6 semanas', 'code', 'bg-green-500', 2),
(3, 'FASE 3: Integración Python + SQL', '4-5 semanas', 'settings', 'bg-purple-500', 3),
(4, 'FASE 4: Aplicación Real', '6-8 semanas', 'rocket', 'bg-orange-500', 4),
(5, 'FASE 5: Especialización Avanzada', '4-6 semanas', 'star', 'bg-red-500', 5)
ON CONFLICT (id) DO NOTHING;

-- Insertar Proyectos de FASE 1
INSERT INTO projects (id, phase_id, title, description, difficulty, requirements, github_tips, unlock_at) VALUES
('sql-easy', 1, '📊 Sistema de Biblioteca', 'Base de datos simple con libros, autores y préstamos. Practica SELECT, WHERE, ORDER BY.', 'easy',
'["Crear tablas: books, authors, loans", "Insertar 20+ registros de ejemplo", "Consultas: buscar libros por autor", "Listar libros más prestados", "Filtrar por fecha de préstamo"]',
'Incluye schema.sql con CREATE TABLE y queries.sql con 10+ consultas útiles', 4),
('sql-medium', 1, '🏪 Sistema de Ventas', 'E-commerce con clientes, productos, pedidos. Practica JOINs, agregaciones, subconsultas.', 'medium',
'["Tablas: customers, products, orders, order_items", "Relaciones con FK correctamente definidas", "Queries con múltiples JOINs", "Reporte de ventas por mes/producto", "Top 10 clientes por compras", "Productos sin stock usando subconsultas"]',
'Crea sample_data.sql con datos realistas y analytics_queries.sql con reportes', 7),
('sql-hard', 1, '🏥 Sistema Hospitalario', 'BD compleja con pacientes, doctores, citas, historiales médicos. Normalización avanzada.', 'hard',
'["Diseño normalizado (3NF): 8+ tablas relacionadas", "Historial médico con versionamiento", "Queries complejas con subconsultas anidadas", "Vistas para reportes médicos", "Triggers para auditoría", "Índices para optimización"]',
'Diagrama ERD, migrations.sql, stored_procedures.sql, y documentation.md explicando decisiones', 10)
ON CONFLICT (id) DO NOTHING;

-- Insertar Proyectos de FASE 2
INSERT INTO projects (id, phase_id, title, description, difficulty, requirements, github_tips, unlock_at) VALUES
('py-easy', 2, '📝 Gestor de Tareas CLI', 'Aplicación de línea de comandos para gestionar tareas. Practica listas, archivos JSON, funciones.', 'easy',
'["Crear, leer, actualizar, eliminar tareas", "Guardar tareas en archivo JSON", "Mostrar tareas pendientes/completadas", "Búsqueda por palabra clave", "Marcar tarea como completada"]',
'Estructura: main.py, models.py, commands.py. Usa argparse para CLI', 4),
('py-medium', 2, '📊 Analizador de Datos CSV', 'Script para analizar datos CSV. Practica pandas, visualización, funciones estadísticas.', 'medium',
'["Cargar archivo CSV", "Estadísticas descriptivas (media, mediana, desv. est.)", "Filtrado y agregaciones", "Visualización con matplotlib/seaborn", "Exportar reportes a PDF/HTML", "Manejo de datos faltantes"]',
'main.py con menú interactivo, utils.py con funciones reutilizables, requirements.txt con dependencias', 7),
('py-hard', 2, '🕷️ Web Scraper Avanzado', 'Scraper con múltiples sitios, almacenamiento en DB, limpieza de datos, APIs.', 'hard',
'["Scraping de 3+ sitios diferentes", "Manejo de JavaScript con Selenium o Playwright", "Limpieza y normalización de datos", "Manejo de errores y reintentos", "Logging y monitoreo", "Unit tests con pytest"]',
'Estructura modular: scrapers/, models/, utils/. Dockerfile para containerización. README con ejemplos', 10)
ON CONFLICT (id) DO NOTHING;

-- Insertar Proyectos de FASE 3
INSERT INTO projects (id, phase_id, title, description, difficulty, requirements, github_tips, unlock_at) VALUES
('integration-easy', 3, '📚 Inventario con SQLite', 'Aplicación Python que gestiona inventario con SQLite local.', 'easy',
'["Conexión a SQLite", "CRUD completo de productos", "Búsqueda y filtros", "Reportes de stock bajo", "Interfaz CLI amigable"]',
'models.py para schema, database.py para conexiones, main.py para lógica', 4),
('integration-medium', 3, '🏦 Sistema Bancario', 'Gestión de cuentas, transacciones, saldos con PostgreSQL y Python.', 'medium',
'["Múltiples tipos de cuentas", "Transacciones atómicas", "Historial de movimientos", "Validaciones de saldo", "Reportes mensuales", "Autenticación básica"]',
'config.py con credenciales, migrations/ para versionamiento de BD, tests/ con pruebas unitarias', 7),
('integration-hard', 3, '🔄 Pipeline ETL Completo', 'Extrae datos de APIs, transforma y carga en PostgreSQL con validación y auditoría.', 'hard',
'["Integración con 2+ APIs", "Transformación y limpieza", "Cargas incrementales", "Validación de datos", "Error handling robusto", "Logging detallado", "Automatización con schedule"]',
'Estructura: extractors/, transformers/, loaders/. Dockerfile. docker-compose.yml. config/ con variables. README con diagramas', 10)
ON CONFLICT (id) DO NOTHING;

-- Insertar Proyectos de FASE 4
INSERT INTO projects (id, phase_id, title, description, difficulty, requirements, github_tips, unlock_at) VALUES
('app-easy', 4, '📖 API de Blog Simple', 'REST API con Flask/Django para blog. Practica modelos, vistas, serialización.', 'easy',
'["CRUD de posts", "CRUD de comentarios", "Validación de datos", "Paginación", "Manejo de errores", "Documentación con Swagger"]',
'models.py, routes.py, requirements.txt. Tests con pytest. Docker para deployment', 4),
('app-medium', 4, '🛍️ Backend E-commerce', 'API REST completa con autenticación, carrito, órdenes, pagos simulados.', 'medium',
'["Autenticación JWT", "Gestión de usuarios y perfiles", "CRUD de productos con categorías", "Carrito de compras", "Órdenes y facturación", "Transacciones seguras", "Validaciones avanzadas"]',
'Estructura MVC, migrations con Alembic, tests unitarios e integración, Postman collection, deployment en Heroku', 7),
('app-hard', 4, '🏢 CRM Empresarial', 'Plataforma completa con usuarios, contactos, leads, pipeline de ventas, reportes.', 'hard',
'["Multi-tenant", "Autenticación y autorización", "Dashboard con métricas", "Reportes avanzados", "Webhooks", "Real-time updates con WebSockets", "API GraphQL opcional", "Testing exhaustivo", "CI/CD"]',
'Clean Architecture. SOLID principles. Docker Compose. Kubernetes ready. API docs con Swagger. SDKs. Terraform IaC', 10)
ON CONFLICT (id) DO NOTHING;

-- Insertar Proyectos de FASE 5
INSERT INTO projects (id, phase_id, title, description, difficulty, requirements, github_tips, unlock_at) VALUES
('advanced-ml', 5, '🤖 ML Model Deployment', 'Entrena modelos ML, crea API y despliégalos en producción.', 'hard',
'["Dataset preparation", "Feature engineering", "Model training (sklearn, TensorFlow)", "Hyperparameter tuning", "Evaluación y validación", "API REST", "Containerización"]',
'notebooks/ para análisis exploratorio, src/ para código limpio, docker para deployment, tests', 4),
('advanced-cloud', 5, '☁️ Arquitectura Cloud Escalable', 'Diseño e implementación de arquitectura cloud con múltiples servicios.', 'hard',
'["Infrastructure as Code (Terraform)", "Microservicios", "Containers (Docker)", "Orquestación (Kubernetes)", "CI/CD pipelines", "Monitoreo y logging"]',
'IaC en Terraform, Docker Compose, GitHub Actions para CI/CD, monitoring stack (Prometheus+Grafana)', 7),
('advanced-devops', 5, '🚀 DevOps Pipeline Completo', 'Automatización completa: CI/CD, testing, deployment, monitoreo, alertas.', 'hard',
'["GitHub Actions/GitLab CI", "Testing automatizado (unit, integration, e2e)", "Security scanning", "Artifact registry", "Blue-green deployment", "Rollback automation", "Monitoring y alertas"]',
'gitlab-ci.yml o .github/workflows/, Dockerfile multi-stage, helm charts, ELK stack, Sentry, PagerDuty', 10)
ON CONFLICT (id) DO NOTHING;

-- Insertar Cursos para FASE 1
INSERT INTO courses (phase_id, title, url, platform) VALUES
(1, 'SQL for Data Science', 'https://www.coursera.org/learn/sql-for-data-science', 'Coursera'),
(1, 'Complete SQL Bootcamp', 'https://www.udemy.com/course/the-complete-sql-bootcamp/', 'Udemy'),
(1, 'SQLBolt', 'https://sqlbolt.com/', 'SQLBolt'),
(1, 'Mode Analytics SQL Tutorial', 'https://mode.com/sql-tutorial/', 'Mode Analytics')
ON CONFLICT DO NOTHING;

-- Insertar Cursos para FASE 2
INSERT INTO courses (phase_id, title, url, platform) VALUES
(2, 'Python for Everybody', 'https://www.coursera.org/specializations/python', 'Coursera'),
(2, 'Complete Python Bootcamp', 'https://www.udemy.com/course/complete-python-bootcamp/', 'Udemy'),
(2, 'Automate the Boring Stuff with Python', 'https://automatetheboringstuff.com/', 'Free Online'),
(2, 'Real Python Tutorials', 'https://realpython.com/', 'Real Python')
ON CONFLICT DO NOTHING;

-- Insertar Cursos para FASE 3
INSERT INTO courses (phase_id, title, url, platform) VALUES
(3, 'SQLAlchemy ORM Tutorial', 'https://docs.sqlalchemy.org/en/14/orm/tutorial.html', 'Official Docs'),
(3, 'Python Database Programming', 'https://www.udemy.com/course/the-complete-python-databases-course/', 'Udemy')
ON CONFLICT DO NOTHING;

-- Insertar Cursos para FASE 4
INSERT INTO courses (phase_id, title, url, platform) VALUES
(4, 'Build Web APIs with Flask', 'https://www.udemy.com/course/rest-api-flask-and-python/', 'Udemy'),
(4, 'Django REST Framework', 'https://www.django-rest-framework.org/tutorial/quickstart/', 'Official Docs'),
(4, 'FastAPI Tutorial', 'https://fastapi.tiangolo.com/tutorial/', 'Official Docs')
ON CONFLICT DO NOTHING;

-- Insertar Cursos para FASE 5
INSERT INTO courses (phase_id, title, url, platform) VALUES
(5, 'TensorFlow Deep Learning', 'https://www.coursera.org/specializations/tensorflow-in-practice', 'Coursera'),
(5, 'Kubernetes Complete Guide', 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/', 'Udemy'),
(5, 'AWS Solutions Architect', 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/', 'Udemy')
ON CONFLICT DO NOTHING;
