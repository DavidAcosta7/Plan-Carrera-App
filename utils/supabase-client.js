// Supabase Client Configuration
class SupabaseClient {
    constructor(url, anonKey) {
        this.url = url;
        this.anonKey = anonKey;
        this.baseURL = `${url}/rest/v1`;
        this.authURL = `${url}/auth/v1`;
    }

    // Registrar nuevo usuario en Supabase Auth
    async signUp(email, password) {
        try {
            const response = await fetch(`${this.authURL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: {}
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.message || 'Error en registro' };
            }
        } catch (error) {
            console.error('Error en signUp:', error);
            return { success: false, error: error.message };
        }
    }

    // Login en Supabase Auth
    async signIn(email, password) {
        try {
            const response = await fetch(`${this.authURL}/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.anonKey,
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Guardar token
                localStorage.setItem('supabase_token', data.access_token);
                localStorage.setItem('supabase_user', JSON.stringify(data.user));
                return { success: true, user: data.user, token: data.access_token };
            } else {
                return { success: false, error: data.error_description || 'Error en login' };
            }
        } catch (error) {
            console.error('Error en signIn:', error);
            return { success: false, error: error.message };
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_user');
    }

    // Obtener usuario actual
    getCurrentUser() {
        const user = localStorage.getItem('supabase_user');
        return user ? JSON.parse(user) : null;
    }

    // Obtener token actual
    getToken() {
        return localStorage.getItem('supabase_token');
    }

    // GET request a API REST
    async get(table, options = {}) {
        const token = this.getToken();
        const url = new URL(`${this.baseURL}/${table}`);
        
        if (options.select) url.searchParams.append('select', options.select);
        if (options.where) Object.entries(options.where).forEach(([key, value]) => {
            url.searchParams.append(`${key}=eq.${value}`);
        });

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'apikey': this.anonKey,
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true, data: await response.json() };
            } else {
                return { success: false, error: 'Error en GET' };
            }
        } catch (error) {
            console.error('Error en GET:', error);
            return { success: false, error: error.message };
        }
    }

    // POST request a API REST
    async post(table, data) {
        const token = this.getToken();

        try {
            const response = await fetch(`${this.baseURL}/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': this.anonKey,
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return { success: true, data: await response.json() };
            } else {
                const error = await response.json();
                return { success: false, error: error.message || 'Error en POST' };
            }
        } catch (error) {
            console.error('Error en POST:', error);
            return { success: false, error: error.message };
        }
    }

    // UPDATE request a API REST
    async update(table, id, data) {
        const token = this.getToken();

        try {
            const response = await fetch(`${this.baseURL}/${table}?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.anonKey,
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return { success: true, data: await response.json() };
            } else {
                return { success: false, error: 'Error en UPDATE' };
            }
        } catch (error) {
            console.error('Error en UPDATE:', error);
            return { success: false, error: error.message };
        }
    }

    // DELETE request a API REST
    async delete(table, id) {
        const token = this.getToken();

        try {
            const response = await fetch(`${this.baseURL}/${table}?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.anonKey,
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: 'Error en DELETE' };
            }
        } catch (error) {
            console.error('Error en DELETE:', error);
            return { success: false, error: error.message };
        }
    }
}

// Inicializar cliente Supabase
const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);
