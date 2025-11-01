import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useCategoriaStore = defineStore('categoria', () => {
  // Estado
  const categorias = ref([])
  const categoria = ref({
    id: null,
    nome: '',
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
  const listarCategorias = async () => {
    loading.value = true
    try {
      const params = {
        pagina: paginaAtual.value,
        itensPorPagina: itensPorPagina.value,
        termo: termoBusca.value,
        ordenarPor: ordenacao.value.campo,
        direcao: ordenacao.value.direcao,
      }

      const resposta = await api.get('/categoria', { params })

      // Ajustado para PagedResult do backend
      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        categorias.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        // Fallback para outros formatos
        categorias.value = resposta.data.items || resposta.data
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
    } finally {
      loading.value = false
    }
  }

  const obterCategoria = async (id) => {
    try {
      const resposta = await api.get(`/categoria/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const criarCategoria = async (dadosCategoria) => {
    loading.value = true
    try {
      const resposta = await api.post('/categoria', dadosCategoria)
      toast.success('Categoria criada com sucesso!')
      await listarCategorias()
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

  const atualizarCategoria = async (id, dadosCategoria) => {
    loading.value = true
    try {
      const resposta = await api.put(`/categoria/${id}`, dadosCategoria)
      toast.success('Categoria atualizada com sucesso!')
      await listarCategorias()
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

  const excluirCategoria = async (id) => {
    try {
      await api.delete(`/categoria/${id}`)
      toast.success('Categoria excluída com sucesso!')
      await listarCategorias()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  // Modal
  const abrirModal = (categoriaParaEditar = null) => {
    if (categoriaParaEditar) {
      categoria.value = { ...categoriaParaEditar }
      modoEdicao.value = true
    } else {
      categoria.value = {
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
    categoria.value = {
      id: null,
      nome: '',
      descricao: '',
    }
  }

  // Filtros e busca
  const aplicarFiltros = () => {
    paginaAtual.value = 1
    listarCategorias()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    paginaAtual.value = 1
    listarCategorias()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarCategorias()
  }

  return {
    // Estado
    categorias,
    categoria,
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
    listarCategorias,
    obterCategoria,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,
  }
})
