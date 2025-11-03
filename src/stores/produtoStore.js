import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useProdutoStore = defineStore('produto', () => {
  // Estado
  const produtos = ref([])
  const produto = ref({
    id: null,
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    unidadeMedida: 'Unidade',
    fatorConversao: 1,
    icms: 0,
    ipi: 0,
    categoriaId: null,
    marcaId: null,
    codigoTributarioId: null,
  })

  const categorias = ref([])
  const marcas = ref([])
  const loading = ref(false)
  const modalAberto = ref(false)
  const modoEdicao = ref(false)

  // Paginação e filtros
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)
  const totalItens = ref(0)
  const termoBusca = ref('')
  const filtroCategoria = ref(null)
  const filtroMarca = ref(null)
  const ordenacao = ref({ campo: 'nome', direcao: 'asc' })

  // Computados
  const totalPaginas = computed(() => Math.ceil(totalItens.value / itensPorPagina.value))

  // Ações
  const listarProdutos = async () => {
    loading.value = true
    try {
      const params = {
        pagina: paginaAtual.value,
        itensPorPagina: itensPorPagina.value,
        termo: termoBusca.value,
        categoriaId: filtroCategoria.value,
        marcaId: filtroMarca.value,
        ordenarPor: ordenacao.value.campo,
        direcao: ordenacao.value.direcao,
      }

  const resposta = await api.get('/produto', { params })

      // Ajustado para PagedResult do backend
      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        produtos.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        // Fallback para outros formatos
        produtos.value = resposta.data.items || resposta.data
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
    } finally {
      loading.value = false
    }
  }

  const obterProduto = async (id) => {
    try {
  const resposta = await api.get(`/produto/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const criarProduto = async (dadosProduto) => {
    loading.value = true
    try {
  const resposta = await api.post('/produto', dadosProduto)
      toast.success('Produto criado com sucesso!')
      await listarProdutos()
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

  const atualizarProduto = async (id, dadosProduto) => {
    loading.value = true
    try {
      const resposta = await api.put(`/produto/${id}`, dadosProduto)
      toast.success('Produto atualizado com sucesso!')
      await listarProdutos()
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

  const excluirProduto = async (id) => {
    try {
  await api.delete(`/produto/${id}`)
      toast.success('Produto excluído com sucesso!')
      await listarProdutos()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const carregarCategorias = async () => {
    try {
      const resposta = await api.get('/categoria/all')
      // Para carregar todas as categorias, usar endpoint sem paginação
      categorias.value = resposta.data.data || resposta.data
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro)
    }
  }

  const carregarMarcas = async () => {
    try {
      const resposta = await api.get('/marca/all')
      // Para carregar todas as marcas, usar endpoint sem paginação
      marcas.value = resposta.data.data || resposta.data
    } catch (erro) {
      console.error('Erro ao carregar marcas:', erro)
    }
  }

  // Modal
  const abrirModal = (produtoParaEditar = null) => {
    if (produtoParaEditar) {
      produto.value = { ...produtoParaEditar }
      modoEdicao.value = true
    } else {
      produto.value = {
        id: null,
        nome: '',
        descricao: '',
        preco: 0,
        estoque: 0,
        unidadeMedida: 'Unidade',
        fatorConversao: 1,
        icms: 0,
        ipi: 0,
        categoriaId: null,
        marcaId: null,
      }
      modoEdicao.value = false
    }
    modalAberto.value = true
  }

  const fecharModal = () => {
    modalAberto.value = false
    modoEdicao.value = false
    produto.value = {
      id: null,
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      unidadeMedida: 'Unidade',
      fatorConversao: 1,
      icms: 0,
      ipi: 0,
      categoriaId: null,
      marcaId: null,
    }
  }

  // Filtros e busca
  const aplicarFiltros = () => {
    paginaAtual.value = 1
    listarProdutos()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    filtroCategoria.value = null
    filtroMarca.value = null
    paginaAtual.value = 1
    listarProdutos()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarProdutos()
  }

  return {
    // Estado
    produtos,
    produto,
    categorias,
    marcas,
    loading,
    modalAberto,
    modoEdicao,
    paginaAtual,
    itensPorPagina,
    totalItens,
    totalPaginas,
    termoBusca,
    filtroCategoria,
    filtroMarca,
    ordenacao,

    // Ações
    listarProdutos,
    obterProduto,
    criarProduto,
    atualizarProduto,
    excluirProduto,
    carregarCategorias,
    carregarMarcas,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,
  }
})
