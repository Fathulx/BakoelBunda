import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { ensureDataVersion } from './services/storage'
import './assets/styles/variables.css'
import './assets/styles/base.css'

// Harus sebelum store Pinia dibuat, supaya store membaca data dengan struktur terbaru.
ensureDataVersion()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
