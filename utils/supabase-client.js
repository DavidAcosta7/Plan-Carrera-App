// Supabase Client Configuration
class SupabaseClient {
    constructor(url, anonKey) {
        this.url = url;
        this.anonKey = anonKey;
        this.baseURL = `${url}/rest/v1`;
        this.authURL = `${url}/auth/v1`;
        this.isConfigured = this.validateConfig();
        
        if (!this.isConfigured) {
            console.warn('⚠️ Supabase no está configurado. Usa variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
        }
    }

    validateConfig() {
        const isValid = this.url && this.url !== 'https://placeholder.supabase.co' && 
                       this.anonKey && this.anonKey !== 'placeholder-key';
        return isValid;
    }

    // Registrar nuevo usuario en Supabase Auth
    async signUp(email, password) {
        if (!this.isConfigured) {
            console.error('❌ Supabase no está configurado');
            return { success: false, error: 'Supabase no configurado. Configura variables de entorno.' };
        }

        try {
            console.log('📝 Registrando usuario:', email);
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
            console.log('📥 Respuesta de signup:', { status: response.status, data });
            
            if (response.ok) {
                console.log('✅ Usuario registrado en Auth:', data.user.id);
                return { success: true, user: data.user };
            } else {
                console.error('❌ Error en signup:', data);
                return { success: false, error: data.message || 'Error en registro' };
            }
        } catch (error) {
            console.error('❌ Error en signUp:', error);
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
        if (!this.isConfigured) {
            console.error('❌ Supabase no está configurado para POST');
            return { success: false, error: 'Supabase no configurado' };
        }

        const token = this.getToken();

        try {
            console.log(`📤 POST a ${table}:`, data);
            const response = await fetch(`${this.baseURL}/${table}`, {
                method: 'POST',
                headers: {
                    'apikey': this.anonKey,
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
            });

            console.log(`📥 Respuesta POST (${table}): status=${response.status}`);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log(`✅ POST exitoso en ${table}:`, responseData);
                return { success: true, data: responseData };
            } else {
                let errorMsg = 'Error en POST';
                try {
                    const error = await response.json();
                    errorMsg = error.message || error.error || JSON.stringify(error);
                } catch (e) {
                    errorMsg = await response.text();
                }
                console.error(`❌ Error en POST (${table}):`, { status: response.status, error: errorMsg });
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error(`❌ Error en POST (${table}):`, error);
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
