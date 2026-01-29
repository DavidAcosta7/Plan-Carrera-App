-- ========================================
-- SCHEMA PARA PLANES DE CARRERA CON IA
-- ========================================
-- Este script debe ejecutarse en Supabase para preparar la base de datos

-- 1. Tabla de planes de carrera
CREATE TABLE IF NOT EXISTS career_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información del plan
    title TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    estimated_duration TEXT,
    total_phases INTEGER DEFAULT 0,
    
    -- Contenido del plan (JSON generado por IA)
    plan_content JSONB NOT NULL,
    
    -- Respuestas del usuario que originaron este plan
    user_answers JSONB NOT NULL,
    
    -- Estado del plan
    status VARCHAR(20) DEFAULT 'active', -- active, archived, deleted
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_primary_plan_per_user UNIQUE (user_id, is_primary)
    WHERE is_primary = TRUE
);

-- Índices para optimizar consultas
CREATE INDEX idx_career_plans_user_id ON career_plans(user_id);
CREATE INDEX idx_career_plans_status ON career_plans(status);
CREATE INDEX idx_career_plans_is_primary ON career_plans(is_primary);
CREATE INDEX idx_career_plans_created_at ON career_plans(created_at DESC);

-- 2. Tabla de progreso en planes
CREATE TABLE IF NOT EXISTS plan_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
    
    -- Progreso completado
    completed_phases JSONB DEFAULT '[]',
    completed_projects JSONB DEFAULT '[]',
    expanded_phases JSONB DEFAULT '[1]',
    
    -- Auditoría
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_plan_progress UNIQUE (user_id, plan_id)
);

-- Índices
CREATE INDEX idx_plan_progress_user_id ON plan_progress(user_id);
CREATE INDEX idx_plan_progress_plan_id ON plan_progress(plan_id);
CREATE INDEX idx_plan_progress_user_plan ON plan_progress(user_id, plan_id);

-- 3. Tabla de auditoría de generación de planes (opcional pero recomendado)
CREATE TABLE IF NOT EXISTS plan_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES career_plans(id) ON DELETE CASCADE,
    
    -- Detalles de la generación
    prompt_used TEXT,
    model_used VARCHAR(100) DEFAULT 'claude-3-5-sonnet-20241022',
    generation_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_plan_generation_user_id ON plan_generation_log(user_id);
CREATE INDEX idx_plan_generation_plan_id ON plan_generation_log(plan_id);

-- 4. Tabla de onboarding answers (opcional para análisis)
CREATE TABLE IF NOT EXISTS onboarding_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Respuestas del flujo de onboarding
    level VARCHAR(50),
    interests JSONB,
    time_per_day VARCHAR(50),
    goal VARCHAR(50),
    deadline VARCHAR(50),
    experience TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_onboarding_responses_user_id ON onboarding_responses(user_id);

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

ALTER TABLE career_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Política para career_plans: Usuarios solo ven sus propios planes
CREATE POLICY career_plans_user_policy ON career_plans
    FOR ALL
    USING (auth.uid() = user_id);

-- Política para plan_progress: Usuarios solo ven su progreso
CREATE POLICY plan_progress_user_policy ON plan_progress
    FOR ALL
    USING (auth.uid() = user_id);

-- Política para plan_generation_log: Usuarios solo ven sus registros
CREATE POLICY plan_generation_log_user_policy ON plan_generation_log
    FOR ALL
    USING (auth.uid() = user_id);

-- Política para onboarding_responses: Usuarios solo ven sus respuestas
CREATE POLICY onboarding_responses_user_policy ON onboarding_responses
    FOR ALL
    USING (auth.uid() = user_id);

-- ========================================
-- VISTAS ÚTILES (Opcional)
-- ========================================

-- Vista de planes activos con estadísticas
CREATE OR REPLACE VIEW active_plans_with_stats AS
SELECT 
    cp.id,
    cp.user_id,
    cp.title,
    cp.created_at,
    COALESCE(jsonb_array_length(pp.completed_phases), 0) as completed_phases,
    COALESCE(jsonb_array_length(pp.completed_projects), 0) as completed_projects,
    cp.total_phases
FROM career_plans cp
LEFT JOIN plan_progress pp ON cp.id = pp.plan_id
WHERE cp.status = 'active'
ORDER BY cp.created_at DESC;

-- Vista de planes primarios (un por usuario)
CREATE OR REPLACE VIEW primary_user_plans AS
SELECT 
    id,
    user_id,
    title,
    description,
    objective,
    estimated_duration,
    total_phases,
    created_at,
    updated_at
FROM career_plans
WHERE is_primary = TRUE AND status = 'active';

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para obtener el próximo paso recomendado
CREATE OR REPLACE FUNCTION get_next_recommended_step(p_user_id UUID, p_plan_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_progress plan_progress%ROWTYPE;
    v_plan career_plans%ROWTYPE;
    v_next_phase_id INTEGER;
BEGIN
    SELECT * INTO v_progress FROM plan_progress 
    WHERE user_id = p_user_id AND plan_id = p_plan_id;
    
    SELECT * INTO v_plan FROM career_plans WHERE id = p_plan_id;
    
    -- Encontrar el siguiente ID de fase
    v_next_phase_id := COALESCE(jsonb_array_length(v_progress.completed_phases), 0) + 1;
    
    RETURN jsonb_build_object(
        'nextPhaseId', v_next_phase_id,
        'totalPhases', v_plan.total_phases,
        'message', 'Complete phase ' || v_next_phase_id
    );
END;
$$ LANGUAGE plpgsql;

-- Función para calcular progreso general
CREATE OR REPLACE FUNCTION calculate_user_progress(p_user_id UUID, p_plan_id UUID)
RETURNS TABLE (
    total_phases INTEGER,
    completed_phases INTEGER,
    total_projects INTEGER,
    completed_projects INTEGER,
    progress_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.total_phases,
        COALESCE(jsonb_array_length(pp.completed_phases), 0)::INTEGER,
        jsonb_array_length((cp.plan_content->'phases')) :: INTEGER as total_projects,
        COALESCE(jsonb_array_length(pp.completed_projects), 0)::INTEGER,
        ROUND(
            ((COALESCE(jsonb_array_length(pp.completed_phases), 0) / NULLIF(cp.total_phases, 0) * 100) +
             (COALESCE(jsonb_array_length(pp.completed_projects), 0) / 
              NULLIF(jsonb_array_length((cp.plan_content->'phases')), 0) * 100)) / 2
        , 1)::NUMERIC
    FROM career_plans cp
    LEFT JOIN plan_progress pp ON cp.id = pp.plan_id
    WHERE cp.id = p_plan_id AND cp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER career_plans_update_timestamp
BEFORE UPDATE ON career_plans
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger para guardar respuestas de onboarding automáticamente
CREATE OR REPLACE FUNCTION save_onboarding_response()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO onboarding_responses (
        user_id, level, interests, time_per_day, goal, deadline, experience
    ) VALUES (
        NEW.user_id,
        NEW.user_answers->>'level',
        NEW.user_answers->'interests',
        NEW.user_answers->>'timePerDay',
        NEW.user_answers->>'goal',
        NEW.user_answers->>'deadline',
        NEW.user_answers->>'experience'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        level = NEW.user_answers->>'level',
        interests = NEW.user_answers->'interests',
        time_per_day = NEW.user_answers->>'timePerDay',
        goal = NEW.user_answers->>'goal',
        deadline = NEW.user_answers->>'deadline',
        experience = NEW.user_answers->>'experience';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER save_onboarding_on_plan_create
AFTER INSERT ON career_plans
FOR EACH ROW
EXECUTE FUNCTION save_onboarding_response();

-- ========================================
-- COMENTARIOS ÚTILES
-- ========================================

COMMENT ON TABLE career_plans IS 'Planes de carrera generados por IA. Cada plan es un documento JSON con fases, proyectos y recursos.';
COMMENT ON TABLE plan_progress IS 'Seguimiento del progreso del usuario en cada plan.';
COMMENT ON TABLE plan_generation_log IS 'Registro de auditoría de generación de planes para análisis.';
COMMENT ON TABLE onboarding_responses IS 'Respuestas del flujo de onboarding para análisis de usuarios.';

COMMENT ON COLUMN career_plans.plan_content IS 'JSON generado por Claude con la estructura completa del plan.';
COMMENT ON COLUMN career_plans.user_answers IS 'JSON con las respuestas del usuario que originaron este plan.';
COMMENT ON COLUMN career_plans.is_primary IS 'Si es TRUE, este es el plan activo del usuario (único por usuario).';

-- ========================================
-- GRANT PERMISOS
-- ========================================

GRANT SELECT, INSERT, UPDATE ON career_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON plan_progress TO authenticated;
GRANT INSERT ON plan_generation_log TO authenticated;
GRANT SELECT, INSERT ON onboarding_responses TO authenticated;

-- ========================================
-- FIN DEL SCHEMA
-- ========================================
