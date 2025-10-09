import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const usePedidoStore = defineStore('pedido', () => {
  // Estado
  const pedidos = ref([])
  const pedido = ref({
    id: null,
    clienteId: null,
    cliente: '',
    dataPedido: '',
    status: 'Pendente',
    observacoes: '',
    itens: [],
    total: 0,
  })

  const clientes = ref([])
  const loading = ref(false)
  const modalAberto = ref(false)
  const modoEdicao = ref(false)

  // Paginação e filtros
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)
  const totalItens = ref(0)
  const termoBusca = ref('')
  const filtroStatus = ref('')
  const ordenacao = ref({ campo: 'dataPedido', direcao: 'desc' })

  // Computados
  const totalPaginas = computed(() => Math.ceil(totalItens.value / itensPorPagina.value))

  // Ações
  const listarPedidos = async () => {
    loading.value = true
    try {
      const params = {
        pagina: paginaAtual.value,
        itensPorPagina: itensPorPagina.value,
        termo: termoBusca.value,
        status: filtroStatus.value,
        ordenarPor: ordenacao.value.campo,
        direcao: ordenacao.value.direcao,
      }

      const resposta = await api.get('/pedido', { params })

      // Ajustado para PagedResult do backend
      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        pedidos.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        // Fallback para outros formatos
        pedidos.value = resposta.data.items || resposta.data
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
    } finally {
      loading.value = false
    }
  }

  const obterPedido = async (id) => {
    try {
      const resposta = await api.get(`/pedido/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const criarPedido = async (dadosPedido) => {
    loading.value = true
    try {
      const resposta = await api.post('pedido/criar/pedido', dadosPedido)
      toast.success('Pedido criado com sucesso!')
      await listarPedidos()
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

  const atualizarPedido = async (id, dadosPedido) => {
    loading.value = true
    try {
      const resposta = await api.put(`/pedido/${id}`, dadosPedido)
      toast.success('Pedido atualizado com sucesso!')
      await listarPedidos()
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

  const excluirPedido = async (id) => {
    try {
      await api.delete(`/pedido/${id}`)
      toast.success('Pedido excluído com sucesso!')
      await listarPedidos()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const carregarClientes = async () => {
    try {
      const resposta = await api.get('/cliente/all')
      clientes.value = resposta.data.data || resposta.data
    } catch (erro) {
      console.error('Erro ao carregar clientes:', erro)
      // Se não tiver API de clientes, usar dados mock
      clientes.value = [
        { id: 1, nome: 'Bar do Zé' },
        { id: 2, nome: 'Mercado Central' },
        { id: 3, nome: 'Restaurante Sabor' },
        { id: 4, nome: 'Padaria do João' },
        { id: 5, nome: 'Lanchonete da Maria' },
      ]
    }
  }

  // Modal
  const abrirModal = (pedidoParaEditar = null) => {
    if (pedidoParaEditar) {
      pedido.value = { ...pedidoParaEditar }
      modoEdicao.value = true
    } else {
      pedido.value = {
        id: null,
        clienteId: null,
        cliente: '',
        dataPedido: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        observacoes: '',
        itens: [],
        total: 0,
      }
      modoEdicao.value = false
    }
    modalAberto.value = true
  }

  const fecharModal = () => {
    modalAberto.value = false
    modoEdicao.value = false
    pedido.value = {
      id: null,
      clienteId: null,
      cliente: '',
      dataPedido: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      observacoes: '',
      itens: [],
      total: 0,
    }
  }

  // Filtros e busca
  const aplicarFiltros = () => {
    paginaAtual.value = 1
    listarPedidos()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    filtroStatus.value = ''
    paginaAtual.value = 1
    listarPedidos()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarPedidos()
  }

  return {
    // Estado
    pedidos,
    pedido,
    clientes,
    loading,
    modalAberto,
    modoEdicao,
    paginaAtual,
    itensPorPagina,
    totalItens,
    totalPaginas,
    termoBusca,
    filtroStatus,
    ordenacao,

    // Ações
    listarPedidos,
    obterPedido,
    criarPedido,
    atualizarPedido,
    excluirPedido,
    carregarClientes,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,
  }
})
