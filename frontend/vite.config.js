import vue from '@vitejs/plugin-vue'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vite.dev/config/

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
    allowedHosts: true
  }
})