import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
import { router } from './routes/routes.js'
import { createPinia } from 'pinia'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

const pinia = createPinia()

const app = createApp(App)

app.use(Quasar, {
  plugins: {}
})

// Pinia SIN persistencia local: los datos viven en el backend
// (MongoDB Atlas) y llegan por axios desde src/services/.
app.use(pinia)

app.use(router)

app.mount('#app')
