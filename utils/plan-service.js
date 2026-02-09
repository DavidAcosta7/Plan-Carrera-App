/**
 * Servicio de gestión de planes de carrera en Supabase
 * Responsabilidades:
 * - Guardar planes generados por IA
 * - Recuperar planes del usuario
 * - Manejar múltiples planes por usuario
 * - Sincronizar progreso
 */

class PlanService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.tableName = 'career_plans';
        this.progressTableName = 'plan_progress';
    }

    /**
     * Guarda un nuevo plan generado por IA
     * @param {string} userId - ID del usuario
     * @param {Object} plan - Plan generado por IA
     * @param {Object} userAnswers - Respuestas del onboarding
     * @returns {Promise<Object>} Plan guardado con ID
     */
    async savePlan(userId, plan, userAnswers) {
        try {
            const planData = {
                user_id: userId,
                title: plan.title,
                description: plan.description,
                objective: plan.objective || '',
                estimated_duration: plan.estimatedDuration || '',
                total_phases: plan.totalPhases || (plan.phases && plan.phases.length) || 0,
                plan_content: JSON.stringify(plan),
                user_answers: JSON.stringify(userAnswers || {}),
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_primary: false
            };

            const response = await this.supabase.post(this.tableName, planData);
            if (!response.success) {
                throw new Error(response.error || 'Error al guardar plan');
            }
            const saved = Array.isArray(response.data) ? response.data[0] : response.data;
            return { success: true, plan: saved, message: 'Plan guardado exitosamente' };
        } catch (error) {
            console.error('Error en savePlan:', error);
            throw error;
        }
    }

    /**
     * Recupera todos los planes de un usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} Array de planes
     */
    async getUserPlans(userId) {
        try {
            const response = await this.supabase.get(this.tableName, { where: { user_id: userId }, select: '*' });
            if (!response.success) {
                throw new Error(response.error || 'Error al obtener planes');
            }
            return (response.data || []).map(p => ({
                ...p,
                plan_content: JSON.parse(p.plan_content || '{}'),
                user_answers: JSON.parse(p.user_answers || '{}')
            }));
        } catch (error) {
            console.error('Error en getUserPlans:', error);
            throw error;
        }
    }

    /**
     * Recupera el plan primario del usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object|null>} Plan primario o null
     */
    async getPrimaryPlan(userId) {
        try {
            const response = await this.supabase.get(this.tableName, { where: { user_id: userId, is_primary: true }, select: '*' });
            if (!response.success) return null;
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            if (!data) return null;
            return {
                ...data,
                plan_content: JSON.parse(data.plan_content || '{}'),
                user_answers: JSON.parse(data.user_answers || '{}')
            };
        } catch (error) {
            console.error('Error en getPrimaryPlan:', error);
            throw error;
        }
    }

    /**
     * Establece un plan como primario
     * @param {string} planId - ID del plan
     */
    async setPrimaryPlan(planId) {
        try {
            const owner = await this.supabase.get(this.tableName, { where: { id: planId }, select: 'user_id' });
            if (!owner.success || !owner.data || !owner.data[0]) throw new Error('Plan not found');
            const userId = owner.data[0].user_id;
            await this.supabase.update(this.tableName, 'all-by-user', { is_primary: false, user_id: userId });
            const response = await this.supabase.update(this.tableName, planId, { is_primary: true });
            if (!response.success) throw new Error(response.error || 'Error setting primary plan');
            return { success: true };
        } catch (error) {
            console.error('Error en setPrimaryPlan:', error);
            throw error;
        }
    }

    /**
     * Obtiene un plan específico por ID
     * @param {string} planId - ID del plan
     * @returns {Promise<Object>} Plan completo
     */
    async getPlanById(planId) {
        try {
            const response = await this.supabase.get(this.tableName, { where: { id: planId }, select: '*' });
            if (!response.success || !response.data || !response.data[0]) {
                throw new Error(response.error || 'Plan no encontrado');
            }
            const data = response.data[0];
            return {
                ...data,
                plan_content: JSON.parse(data.plan_content || '{}'),
                user_answers: JSON.parse(data.user_answers || '{}')
            };
        } catch (error) {
            console.error('Error en getPlanById:', error);
            throw error;
        }
    }

    /**
     * Actualiza un plan existente
     * @param {string} planId - ID del plan
     * @param {Object} updates - Campos a actualizar
     */
    async updatePlan(planId, updates) {
        try {
            const updateData = { ...updates, updated_at: new Date().toISOString() };
            if (updates.plan_content && typeof updates.plan_content === 'object') {
                updateData.plan_content = JSON.stringify(updates.plan_content);
            }
            const response = await this.supabase.update(this.tableName, planId, updateData);
            if (!response.success) throw new Error(response.error || 'Error al actualizar plan');
            return { success: true };
        } catch (error) {
            console.error('Error en updatePlan:', error);
            throw error;
        }
    }

    /**
     * Elimina un plan (soft delete)
     * @param {string} planId - ID del plan
     */
    async deletePlan(planId) {
        try {
            const response = await this.supabase.update(this.tableName, planId, { status: 'deleted', updated_at: new Date().toISOString() });
            if (!response.success) throw new Error(response.error || 'Error eliminando plan');
            return { success: true };
        } catch (error) {
            console.error('Error en deletePlan:', error);
            throw error;
        }
    }

    /**
     * Guarda el progreso del usuario en un plan
     * @param {string} userId - ID del usuario
     * @param {string} planId - ID del plan
     * @param {Object} progress - Objeto de progreso
     */
    async saveProgress(userId, planId, progress) {
        try {
            const existing = await this.supabase.get(this.progressTableName, { where: { user_id: userId, plan_id: planId }, select: 'id' });
            const progressData = {
                user_id: userId,
                plan_id: planId,
                completed_phases: JSON.stringify(progress.completedPhases || []),
                completed_projects: JSON.stringify(progress.completedProjects || []),
                expanded_phases: JSON.stringify(progress.expandedPhases || [1]),
                last_updated: new Date().toISOString()
            };
            if (existing.success && existing.data && existing.data[0]) {
                const id = existing.data[0].id;
                const response = await this.supabase.update(this.progressTableName, id, progressData);
                if (!response.success) throw new Error(response.error || 'Error al actualizar progreso');
            } else {
                const response = await this.supabase.post(this.progressTableName, progressData);
                if (!response.success) throw new Error(response.error || 'Error al insertar progreso');
            }
            return { success: true };
        } catch (error) {
            console.error('Error en saveProgress:', error);
            throw error;
        }
    }

    /**
     * Obtiene el progreso del usuario
     * @param {string} userId - ID del usuario
     * @param {string} planId - ID del plan
     */
    async getProgress(userId, planId) {
        try {
            const response = await this.supabase.get(this.progressTableName, { where: { user_id: userId, plan_id: planId }, select: '*' });
            if (!response.success || !response.data || !response.data[0]) {
                return { completedPhases: [], completedProjects: [], expandedPhases: [1] };
            }
            const data = response.data[0];
            return {
                completedPhases: JSON.parse(data.completed_phases || '[]'),
                completedProjects: JSON.parse(data.completed_projects || '[]'),
                expandedPhases: JSON.parse(data.expanded_phases || '[1]')
            };
        } catch (error) {
            console.error('Error en getProgress:', error);
            throw error;
        }
    }

    /**
     * Verifica si el usuario tiene al menos un plan
     * @param {string} userId - ID del usuario
     * @returns {Promise<boolean>}
     */
    async userHasPlans(userId) {
        try {
            const response = await this.supabase
                .from(this.tableName)
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('status', 'active');

            return (response.count || 0) > 0;
        } catch (error) {
            console.error('Error en userHasPlans:', error);
            return false;
        }
    }

    /**
     * Obtiene estadísticas del plan del usuario
     * @param {string} userId - ID del usuario
     * @param {string} planId - ID del plan
     */
    async getPlanStats(userId, planId) {
        try {
            const plan = await this.getPlanById(planId);
            const progress = await this.getProgress(userId, planId);

            const totalPhases = plan.total_phases;
            const totalProjects = plan.plan_content.phases?.reduce(
                (acc, phase) => acc + (phase.projects?.length || 0),
                0
            ) || 0;

            return {
                totalPhases,
                totalProjects,
                completedPhases: progress.completedPhases.length,
                completedProjects: progress.completedProjects.length,
                phaseProgress: ((progress.completedPhases.length / totalPhases) * 100).toFixed(1),
                projectProgress: ((progress.completedProjects.length / totalProjects) * 100).toFixed(1),
                overallProgress: (
                    ((progress.completedPhases.length / totalPhases) * 100 +
                    (progress.completedProjects.length / totalProjects) * 100) / 2
                ).toFixed(1)
            };
        } catch (error) {
            console.error('Error en getPlanStats:', error);
            throw error;
        }
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlanService;
}
