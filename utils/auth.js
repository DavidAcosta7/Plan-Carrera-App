// Sistema de Autenticación Local
class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    register(userData) {
        const user = {
            id: Date.now().toString(),
            email: userData.email,
            name: userData.name,
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            hasPlan: false,
            plan: null,
            progress: {
                completedPhases: [],
                completedProjects: [],
                expandedPhases: [1]
            }
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;
        return user;
    }

    login(email, password) {
        const userData = localStorage.getItem('user');
        if (!userData) return null;

        const user = JSON.parse(userData);
        if (user.email === email && this.verifyPassword(password, user.password)) {
            this.currentUser = user;
            return user;
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
    }

    updatePlan(plan) {
        if (!this.currentUser) return false;
        
        this.currentUser.hasPlan = true;
        this.currentUser.plan = plan;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        return true;
    }

    updateProgress(progress) {
        if (!this.currentUser) return false;
        
        this.currentUser.progress = { ...this.currentUser.progress, ...progress };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        return true;
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasPlan() {
        return this.currentUser && this.currentUser.hasPlan;
    }

    // Métodos de seguridad básicos (no para producción)
    hashPassword(password) {
        // En producción usar bcrypt o similar
        return btoa(password + 'salt');
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
}

// Instancia global de autenticación
const auth = new Auth();

export default auth;
