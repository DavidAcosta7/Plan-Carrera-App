// Sistema de Routing SPA
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.container = document.getElementById('app');
        this.init();
    }

    init() {
        // Escuchar cambios en el hash
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
        
        // Manejar clicks en enlaces
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });
    }

    addRoute(path, component) {
        this.routes[path] = component;
    }

    navigate(path) {
        window.location.hash = path;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.routes[hash] || this.routes['/'];
        
        if (route && route !== this.currentRoute) {
            this.currentRoute = route;
            this.render(route);
        }
    }

    async render(component) {
        if (typeof component === 'function') {
            this.container.innerHTML = await component();
        } else {
            this.container.innerHTML = component;
        }
        
        // Ejecutar scripts después del render
        this.executeScripts();
    }

    executeScripts() {
        const scripts = this.container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.head.appendChild(newScript);
            document.head.removeChild(newScript);
        });
    }

    // Protección de rutas
    requireAuth() {
        const user = localStorage.getItem('user');
        if (!user) {
            this.navigate('/register');
            return false;
        }
        return true;
    }

    // Verificar si el usuario tiene plan
    requirePlan() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.hasPlan) {
            this.navigate('/onboarding');
            return false;
        }
        return true;
    }
}

// Instancia global del router
const router = new Router();

export default router;
