// Supabase Client Configuration
// Sin dependencias de módulos ES6, compatible con scripts normales

(function() {
    'use strict';
    
    class SupabaseClient {
        constructor(url, anonKey) {
            this.url = url;
            this.anonKey = anonKey;
            this.baseURL = `${url}/rest/v1`;
            this.authURL = `${url}/auth/v1`;
            this.isConfigured = this.validateConfig();
            
            if (!this.isConfigured) {
                console.warn('⚠️ Supabase no está configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel');
            } else {
                console.log('✅ Supabase cliente inicializado correctamente');
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
                const requestBody = {
                    email,
                    password,
                    data: {}
                };
                console.log('📤 Body enviado:', JSON.stringify(requestBody));
                
                const response = await fetch(`${this.authURL}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.anonKey,
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                console.log('📥 Respuesta completa de signup:', { 
                    status: response.status, 
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    data: data 
                });
                
                // Validar que response.ok (200-299) y que data.user exista
                if (!response.ok) {
                    console.error('❌ Error en signup (HTTP ' + response.status + '):', data);
                    
                    // Manejo especial para rate limiting
                    if (response.status === 429) {
                        const errorMsg = 'Demasiados intentos de registro. Por favor espera unos minutos antes de intentar nuevamente.';
                        console.warn('⏳ Rate limit alcanzado:', data.msg);
                        return { success: false, error: errorMsg, retryAfter: 300 }; // 5 minutos
                    }
                    
                    // Manejo especial para usuario ya existe
                    if (data.error_code === 'user_already_exists') {
                        const errorMsg = 'Este email ya está registrado. Por favor, inicia sesión o usa otro email.';
                        return { success: false, error: errorMsg };
                    }
                    
                    const errorMsg = data.message || data.error || data.error_description || data.msg || 'Error en registro';
                    return { success: false, error: errorMsg };
                }
                
                // CASO 1: Respuesta con user (confirmación de email deshabilitada)
                if (data && data.user && data.user.id) {
                    console.log('✅ Usuario registrado en Auth (sin confirmación requerida):', data.user.id);
                    return { success: true, user: data.user };
                }
                
                // CASO 2: Respuesta sin user pero con identificador (confirmación de email habilitada)
                // En este caso creamos un usuario temporal con email para poder continuar
                if (data && data.email) {
                    console.log('✅ Usuario registrado (confirmación de email requerida):', data.email);
                    // Retornar usuario temporal basado en email
                    return { 
                        success: true, 
                        user: { 
                            id: 'temp-' + Math.random().toString(36).substring(7),
                            email: data.email,
                            email_confirmed_at: null
                        },
                        needsEmailConfirmation: true
                    };
                }
                
                // CASO 3: Respuesta OK pero sin usuario ni email - error desconocido
                console.error('❌ Error: respuesta OK (200) pero sin user ni email en data', data);
                return { 
                    success: false, 
                    error: 'Registro parcialmente exitoso pero sin información de usuario. Por favor intenta iniciar sesión.',
                    data: data
                };
                
            } catch (error) {
                console.error('❌ Error en signUp:', error);
                console.error('   Stack:', error.stack);
                return { success: false, error: error.message || 'Error desconocido en registro' };
            }
        }

        // Login en Supabase Auth
        async signIn(email, password) {
            if (!this.isConfigured) {
                console.error('❌ Supabase no está configurado para login');
                return { success: false, error: 'Supabase no configurado' };
            }

            try {
                console.log('🔐 Login para:', email);
                const requestBody = { email, password };
                console.log('📤 Body enviado:', JSON.stringify(requestBody));
                
                const response = await fetch(`${this.authURL}/token?grant_type=password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.anonKey,
                    },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                console.log('📥 Respuesta completa de login:', { 
                    status: response.status,
                    statusText: response.statusText,
                    data: data 
                });
                
                // Validar que response.ok (200-299) y que data.user exista
                if (!response.ok) {
                    console.error('❌ Error en login (HTTP ' + response.status + '):', data);
                    const errorMsg = data.error_description || data.error || 'Error en login';
                    return { success: false, error: errorMsg };
                }
                
                if (!data || !data.user) {
                    console.error('❌ Error: respuesta OK (200) pero sin user en data', data);
                    return { success: false, error: 'Login parcial: autenticación exitosa pero sin datos de usuario' };
                }
                
                localStorage.setItem('supabase_token', data.access_token);
                localStorage.setItem('supabase_user', JSON.stringify(data.user));
                console.log('✅ Login exitoso, usuario:', data.user.id);
                return { success: true, user: data.user, token: data.access_token };
                
            } catch (error) {
                console.error('❌ Error en signIn:', error);
                console.error('   Stack:', error.stack);
                return { success: false, error: error.message || 'Error desconocido en login' };
            }
        }

        // Logout
        logout() {
            localStorage.removeItem('supabase_token');
            localStorage.removeItem('supabase_user');
            console.log('🚪 Logout completado');
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
    // Lee de la configuración global inyectada en HTML
    const supabaseUrl = (window.SUPABASE_CONFIG?.url) || 'https://placeholder.supabase.co';
    const supabaseAnonKey = (window.SUPABASE_CONFIG?.anonKey) || 'placeholder-key';

    console.log('🔧 Configuración de Supabase:');
    console.log('  URL:', supabaseUrl === 'https://placeholder.supabase.co' ? '❌ No configurada' : '✅ ' + supabaseUrl.substring(0, 20) + '...');
    console.log('  Key:', supabaseAnonKey === 'placeholder-key' ? '❌ No configurada' : '✅ ' + supabaseAnonKey.substring(0, 20) + '...');

    // IMPORTANTE: Hacer supabase disponible globalmente
    window.supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);

    console.log('✅ Supabase cliente cargado globalmente como window.supabase');
})(); // Fin de IIFE
