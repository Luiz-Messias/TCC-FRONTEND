import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axiosConfig'

export const useCodigoTributarioStore = defineStore('codigoTributario', () => {
  const codigos = ref([])
  const codigosCST = ref([])
  const codigosCSOSN = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/CodigoTributario')
      codigos.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data || 'Erro ao buscar códigos tributários'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAtivosByTipo = async (tipo) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/CodigoTributario/ativos/${tipo}`)
      if (tipo === 'CST') {
        codigosCST.value = response.data
      } else {
        codigosCSOSN.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data || 'Erro ao buscar códigos tributários'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchById = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/CodigoTributario/${id}`)
      return response.data
    } catch (err) {
      error.value = err.response?.data || 'Erro ao buscar código tributário'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchByCodigo = async (codigo, tipo) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/CodigoTributario/${codigo}/${tipo}`)
      return response.data
    } catch (err) {
      error.value = err.response?.data || 'Erro ao buscar código tributário'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    codigos,
    codigosCST,
    codigosCSOSN,
    isLoading,
    error,
    fetchAll,
    fetchAtivosByTipo,
    fetchById,
    fetchByCodigo,
  }
})
