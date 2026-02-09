/**
 * Servicio de Autenticación Mejorado
 * Integración con Supabase + Detección de primer login
 */

class AuthService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.currentUser = null;
        this.isFirstTime = false;
        this.init();
    }

    /**
     * Inicializa el servicio con usuario actual
     */
    async init() {
        if (!this.supabase || !this.supabase.isConfigured) {
            console.warn('⚠️ Supabase no está configurado, usando localStorage');
            this.loadFromLocalStorage();
        } else {
            await this.loadCurrentUser();
        }
    }

    /**
     * Registra un nuevo usuario
     */
    async register(email, password, name) {
        try {
            if (this.supabase && this.supabase.isConfigured) {
                // Registrar en Supabase
                const result = await this.supabase.signUp(email, password);
                
                if (!result.success) {
                    throw new Error(result.error);
                }

                this.currentUser = {
                    id: result.user.id,
                    email: result.user.email,
                    name: name,
                    createdAt: new Date().toISOString(),
                    isFirstTime: true,
                    hasPlan: false
                };

                // Guardar en localStorage como backup
                this.saveToLocalStorage();

                return {
                    success: true,
                    user: this.currentUser,
                    message: 'Registro exitoso. Verifica tu email.'
                };
            } else {
                // Fallback a localStorage
                const user = {
                    id: Date.now().toString(),
                    email: email,
                    name: name,
                    password: this.hashPassword(password),
                    createdAt: new Date().toISOString(),
                    isFirstTime: true,
                    hasPlan: false
                };

                localStorage.setItem('user', JSON.stringify(user));
                this.currentUser = user;
                this.isFirstTime = true;

                return {
                    success: true,
                    user: user,
                    message: 'Registro exitoso (local)'
                };
            }
        } catch (error) {
            console.error('Error en register:', error);
            throw error;
        }
    }

    /**
     * Login de usuario
     */
    async login(email, password) {
        try {
            if (this.supabase && this.supabase.isConfigured) {
                // Login en Supabase
                const result = await this.supabase.signIn(email, password);
                
                if (!result.success) {
                    throw new Error(result.error);
                }

                this.currentUser = {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.user_metadata?.name || email.split('@')[0],
                    createdAt: result.user.created_at,
                    isFirstTime: await this.checkIsFirstTime(result.user.id),
                    hasPlan: false
                };

                // Guardar en localStorage
                this.saveToLocalStorage();

                return {
                    success: true,
                    user: this.currentUser,
                    isFirstTime: this.isFirstTime
                };
            } else {
                // Fallback a localStorage
                const userData = localStorage.getItem('user');
                if (!userData) {
                    return { success: false, error: 'Usuario no encontrado' };
                }

                const user = JSON.parse(userData);
                if (user.email === email && this.verifyPassword(password, user.password)) {
                    this.currentUser = user;
                    this.isFirstTime = user.isFirstTime || false;
                    return {
                        success: true,
                        user: user,
                        isFirstTime: this.isFirstTime
                    };
                }

                return { success: false, error: 'Credenciales inválidas' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Comprueba si es el primer login del usuario
     */
    async checkIsFirstTime(userId) {
        try {
            if (!this.supabase || !this.supabase.isConfigured) {
                return !localStorage.getItem('hasPlans_' + userId);
            }
            const response = await this.supabase.get('career_plans', { where: { user_id: userId }, select: 'id', limit: 1 });
            if (!response.success) return true;
            const count = Array.isArray(response.data) ? response.data.length : (response.count || 0);
            return count === 0;
        } catch (error) {
            console.error('Error en checkIsFirstTime:', error);
            return true; // Por defecto, asumir que es primera vez
        }
    }

    /**
     * Marca que el usuario completó el onboarding
     */
    async markOnboardingComplete(userId) {
        try {
            localStorage.setItem('hasPlans_' + userId, 'true');
            this.isFirstTime = false;

            if (this.currentUser) {
                this.currentUser.isFirstTime = false;
                this.saveToLocalStorage();
            }

            return { success: true };
        } catch (error) {
            console.error('Error en markOnboardingComplete:', error);
            throw error;
        }
    }

    /**
     * Logout del usuario
     */
    async logout() {
        try {
            if (this.supabase && this.supabase.isConfigured) {
                this.supabase.logout();
            }

            this.currentUser = null;
            this.isFirstTime = false;
            localStorage.removeItem('user');
            localStorage.removeItem('currentUserId');

            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    }

    /**
     * Obtiene el usuario actual
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Verifica si está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Verifica si es el primer login
     */
    isFirstLogin() {
        return this.isFirstTime;
    }

    /**
     * Actualiza la información del usuario
     */
    async updateUserInfo(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user logged in');
            }

            this.currentUser = { ...this.currentUser, ...updates };
            this.saveToLocalStorage();

            if (this.supabase && this.supabase.isConfigured) {
                // Actualizar en Supabase si está disponible
                await this.supabase.updateUserMetadata(this.currentUser.id, updates);
            }

            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Error en updateUserInfo:', error);
            throw error;
        }
    }

    /**
     * Carga el usuario actual
     */
    async loadCurrentUser() {
        try {
            if (this.supabase && this.supabase.isConfigured) {
                const user = this.supabase.getCurrentUser();
                if (user) {
                    this.currentUser = {
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.name || user.email.split('@')[0],
                        createdAt: user.created_at,
                        isFirstTime: await this.checkIsFirstTime(user.id),
                        hasPlan: false
                    };
                    this.saveToLocalStorage();
                }
            } else {
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading current user:', error);
            this.loadFromLocalStorage();
        }
    }

    /**
     * Guarda en localStorage
     */
    saveToLocalStorage() {
        if (this.currentUser) {
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            localStorage.setItem('currentUserId', this.currentUser.id);
            localStorage.setItem('isFirstTime', this.isFirstTime.toString());
        }
    }

    /**
     * Carga desde localStorage
     */
    loadFromLocalStorage() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isFirstTime = localStorage.getItem('isFirstTime') === 'true';
        }
    }

    // Métodos de seguridad básicos (para fallback local)
    hashPassword(password) {
        return btoa(password + 'salt');
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}
