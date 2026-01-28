import { defineConfig } from 'vite'

export default defineConfig({
  // Las variables de entorno se cargan automáticamente
  define: {
    __VITE_ENV__: JSON.stringify(process.env)
  },
  server: {
    middlewareMode: true
  },
  // Asegurar que las variables VITE_ se exponen al cliente
  envPrefix: 'VITE_'
})
