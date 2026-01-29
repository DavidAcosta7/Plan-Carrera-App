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
                total_phases: plan.totalPhases || plan.phases?.length || 0,
                plan_content: JSON.stringify(plan),
                user_answers: JSON.stringify(userAnswers),
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_primary: false // Se establecerá en true el primer plan
            };

            const response = await this.supabase
                .from(this.tableName)
                .insert([planData])
                .select();

            if (response.error) {
                throw new Error(`Error saving plan: ${response.error.message}`);
            }

            // Si es el primer plan del usuario, establécelo como primario
            const existingPlans = await this.getUserPlans(userId);
            if (!existingPlans || existingPlans.length === 1) {
                await this.setPrimaryPlan(response.data[0].id);
            }

            return {
                success: true,
                plan: response.data[0],
                message: 'Plan guardado exitosamente'
            };
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
            const response = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (response.error) {
                throw new Error(`Error fetching plans: ${response.error.message}`);
            }

            // Parsear plan_content
            return response.data?.map(plan => ({
                ...plan,
                plan_content: JSON.parse(plan.plan_content || '{}'),
                user_answers: JSON.parse(plan.user_answers || '{}')
            })) || [];
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
            const response = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .eq('is_primary', true)
                .eq('status', 'active')
                .single();

            if (response.error && response.error.code !== 'PGRST116') {
                throw new Error(`Error fetching primary plan: ${response.error.message}`);
            }

            if (response.data) {
                return {
                    ...response.data,
                    plan_content: JSON.parse(response.data.plan_content || '{}'),
                    user_answers: JSON.parse(response.data.user_answers || '{}')
                };
            }

            return null;
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
            // Primero, desestablece todos los planes primarios del usuario
            const plan = await this.supabase
                .from(this.tableName)
                .select('user_id')
                .eq('id', planId)
                .single();

            if (!plan.data) {
                throw new Error('Plan not found');
            }

            // Desactivar primarios anteriores
            await this.supabase
                .from(this.tableName)
                .update({ is_primary: false })
                .eq('user_id', plan.data.user_id);

            // Establecer este como primario
            const response = await this.supabase
                .from(this.tableName)
                .update({ is_primary: true })
                .eq('id', planId);

            if (response.error) {
                throw new Error(`Error setting primary plan: ${response.error.message}`);
            }

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
            const response = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', planId)
                .eq('status', 'active')
                .single();

            if (response.error) {
                throw new Error(`Error fetching plan: ${response.error.message}`);
            }

            return {
                ...response.data,
                plan_content: JSON.parse(response.data.plan_content || '{}'),
                user_answers: JSON.parse(response.data.user_answers || '{}')
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
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            // Si se actualiza plan_content, stringificarlo
            if (updates.plan_content && typeof updates.plan_content === 'object') {
                updateData.plan_content = JSON.stringify(updates.plan_content);
            }

            const response = await this.supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', planId);

            if (response.error) {
                throw new Error(`Error updating plan: ${response.error.message}`);
            }

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
            const response = await this.supabase
                .from(this.tableName)
                .update({ status: 'deleted', updated_at: new Date().toISOString() })
                .eq('id', planId);

            if (response.error) {
                throw new Error(`Error deleting plan: ${response.error.message}`);
            }

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
            // Verificar si ya existe progreso
            const existing = await this.supabase
                .from(this.progressTableName)
                .select('id')
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .single();

            const progressData = {
                user_id: userId,
                plan_id: planId,
                completed_phases: JSON.stringify(progress.completedPhases || []),
                completed_projects: JSON.stringify(progress.completedProjects || []),
                expanded_phases: JSON.stringify(progress.expandedPhases || [1]),
                last_updated: new Date().toISOString()
            };

            if (existing.data) {
                // Actualizar
                const response = await this.supabase
                    .from(this.progressTableName)
                    .update(progressData)
                    .eq('id', existing.data.id);

                if (response.error) throw response.error;
            } else {
                // Insertar
                const response = await this.supabase
                    .from(this.progressTableName)
                    .insert([progressData]);

                if (response.error) throw response.error;
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
            const response = await this.supabase
                .from(this.progressTableName)
                .select('*')
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .single();

            if (response.error && response.error.code === 'PGRST116') {
                // No existe progreso, retornar default
                return {
                    completedPhases: [],
                    completedProjects: [],
                    expandedPhases: [1]
                };
            }

            if (response.error) {
                throw new Error(`Error fetching progress: ${response.error.message}`);
            }

            return {
                completedPhases: JSON.parse(response.data.completed_phases || '[]'),
                completedProjects: JSON.parse(response.data.completed_projects || '[]'),
                expandedPhases: JSON.parse(response.data.expanded_phases || '[1]')
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
