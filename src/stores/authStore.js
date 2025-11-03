import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'

import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

// Store de autenticação do sistema de gestão de bebidas
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const role = ref(localStorage.getItem('role') || 'User')

  const estaAutenticado = computed(() => !!token.value)

  const login = async ({ email, password, manterConectado }) => {
    try {
  const resposta = await api.post('/Token/LoginUser', {
        email,
        password,
      })

      token.value = resposta.data.data.token
      if (token.value) {
        try {
          const payload = JSON.parse(atob(token.value.split('.')[1]))
          role.value =
            payload.role ||
            payload.Role ||
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            'User'
        } catch (e) {
          role.value = 'User'
        }
      }

      if (manterConectado) {
        localStorage.setItem('token', token.value)
        localStorage.setItem('role', role.value)
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('role')
      } else {
        sessionStorage.setItem('token', token.value)
        sessionStorage.setItem('role', role.value)
        localStorage.removeItem('token')
        localStorage.removeItem('role')
      }

      return true
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return false
    }
  }

  const logout = () => {
    token.value = ''
    role.value = 'User'
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('role')
  }

  return { token, role, estaAutenticado, login, logout }
})
