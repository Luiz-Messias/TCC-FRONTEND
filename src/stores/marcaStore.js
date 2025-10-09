import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useMarcaStore = defineStore('marca', () => {
  // Estado
  const marcas = ref([])
  const marca = ref({
    id: 0,
    nome: '',
    descricao: '',
  })

  const loading = ref(false)
  const modalAberto = ref(false)
  const modoEdicao = ref(false)

  // Paginação e filtros
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)
  const totalItens = ref(0)
  const termoBusca = ref('')
  const ordenacao = ref({ campo: 'nome', direcao: 'asc' })

  // Computados
  const totalPaginas = computed(() => Math.ceil(totalItens.value / itensPorPagina.value))

  // Ações
  const listarMarcas = async () => {
    loading.value = true
    try {
      const params = {
        pagina: paginaAtual.value,
        itensPorPagina: itensPorPagina.value,
        termo: termoBusca.value,
        ordenarPor: ordenacao.value.campo,
        direcao: ordenacao.value.direcao,
      }

      const resposta = await api.get('/marca', { params })

      // Ajustado para PagedResult do backend
      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        marcas.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        // Fallback para outros formatos
        marcas.value = resposta.data.items || resposta.data
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
    } finally {
      loading.value = false
    }
  }

  const obterMarca = async (id) => {
    try {
      const resposta = await api.get(`/marca/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const criarMarca = async (dadosMarca) => {
    loading.value = true
    try {
      const resposta = await api.post('/marca', dadosMarca)
      toast.success('Marca criada com sucesso!')
      await listarMarcas()
      fecharModal()
      return resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      loading.value = false
    }
  }

  const atualizarMarca = async (id, dadosMarca) => {
    loading.value = true
    try {
      const resposta = await api.put(`/marca`, dadosMarca)
      toast.success('Marca atualizada com sucesso!')
      await listarMarcas()
      fecharModal()
      return resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      loading.value = false
    }
  }

  const excluirMarca = async (id) => {
    try {
      await api.delete(`/marca/${id}`)
      toast.success('Marca excluída com sucesso!')
      await listarMarcas()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  // Modal
  const abrirModal = (marcaParaEditar = null) => {
    if (marcaParaEditar) {
      marca.value = { ...marcaParaEditar }
      modoEdicao.value = true
    } else {
      marca.value = {
        id: null,
        nome: '',
        descricao: '',
      }
      modoEdicao.value = false
    }
    modalAberto.value = true
  }

  const fecharModal = () => {
    modalAberto.value = false
    modoEdicao.value = false
    marca.value = {
      id: null,
      nome: '',
      descricao: '',
    }
  }

  // Filtros e busca
  const aplicarFiltros = () => {
    paginaAtual.value = 1
    listarMarcas()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    paginaAtual.value = 1
    listarMarcas()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarMarcas()
  }

  return {
    // Estado
    marcas,
    marca,
    loading,
    modalAberto,
    modoEdicao,
    paginaAtual,
    itensPorPagina,
    totalItens,
    totalPaginas,
    termoBusca,
    ordenacao,

    // Ações
    listarMarcas,
    obterMarca,
    criarMarca,
    atualizarMarca,
    excluirMarca,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,
  }
})
