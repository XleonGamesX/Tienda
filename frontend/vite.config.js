import vue from '@vitejs/plugin-vue'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vite.dev/config/

// En desarrollo (y con `npm run preview`) las peticiones a /api — URL
// relativa, mismo origen — se reenvían al backend en local. El proxy corre
// EN EL SERVIDOR, así que 'localhost:3000' siempre es la máquina donde vive
// el backend: la app funciona igual abierta desde otro dispositivo de la red.
const proxyApi = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass')
    })
  ],

  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: proxyApi
  },

  preview: {
    port: 4173,
    proxy: proxyApi
  }
})