import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  // baseURL: 'https://localhost:44347/api',
  baseURL: 'https://dropeimports.com.br/api',
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
