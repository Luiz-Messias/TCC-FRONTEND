import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// ✅ CORRIGIDO: Usar variável de ambiente para URL da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dropeimports.com.br/api/',
})

// Intercepta cada requisição e adiciona o token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
