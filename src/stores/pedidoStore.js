import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'
import { useEstoqueStore } from './estoqueStore'

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

  const listarPedidosComParametros = async (params) => {
    loading.value = true
    try {
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
      // Obter store de estoque
      const estoqueStore = useEstoqueStore()

      // Verificar disponibilidade de estoque antes de criar o pedido
      for (const item of dadosPedido.itens) {
        debugger
        const verificacao = await estoqueStore.verificarDisponibilidade(
          item.produtoId,
          item.quantidade,
        )
        if (!verificacao.disponivel) {
          toast.error(`${item.produtoNome || 'Produto'}: ${verificacao.mensagem}`)
          loading.value = false
          throw new Error(verificacao.mensagem)
        }
      }

      // Criar o pedido
      const resposta = await api.post('pedido/criar/pedido', dadosPedido)

      // Se o pedido foi criado com sucesso, dar baixa no estoque
      const pedidoCriado = resposta.data.data || resposta.data

      if (!pedidoCriado.pedidoId) {
        console.error('⚠️ Pedido criado sem ID:', pedidoCriado)
        toast.warning('Pedido criado, mas não foi possível dar baixa automática no estoque.')
      } else {
        await estoqueStore.darBaixaAutomatica(pedidoCriado.pedidoId, dadosPedido.itens)
      }

      toast.success('Pedido criado com sucesso e estoque atualizado!')
      await listarPedidos()
      fecharModal()
      return pedidoCriado
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      loading.value = false
    }
  }

  const criarOrcamento = async (dadosOrcamento) => {
    loading.value = true
    try {
      // Orçamento NÃO precisa verificar estoque
      const resposta = await api.post('pedido/orcamentos', dadosOrcamento)
      const orcamentoCriado = resposta.data.data || resposta.data

      toast.success('Orçamento criado com sucesso!')
      await listarPedidos()
      fecharModal()
      return orcamentoCriado
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      loading.value = false
    }
  }

  const converterOrcamentoEmPedido = async (orcamentoId) => {
    loading.value = true
    try {
      const resposta = await api.post(`pedido/${orcamentoId}/converter`)
      const pedidoConvertido = resposta.data.data || resposta.data

      toast.success('Orçamento convertido em pedido com sucesso! Estoque atualizado.')
      await listarPedidos()
      return pedidoConvertido
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
      toast.success('Pedido cancelado com sucesso!')
      await listarPedidos()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const cancelarPedido = async (id) => {
    try {
      await api.patch(`/pedido/${id}/cancelar`)
      toast.success('Pedido cancelado com sucesso!')
      await listarPedidos()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const concluirPedido = async (id) => {
    try {
      await api.patch(`/pedido/${id}/concluir`)
      toast.success('Pedido concluído com sucesso!')
      await listarPedidos()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const reativarPedido = async (id) => {
    try {
      await api.patch(`/pedido/${id}/reativar`)
      toast.success('Pedido reativado com sucesso!')
      await listarPedidos()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const obterCorStatus = (status) => {
    const cores = {
      ATIVO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONCLUIDO: 'bg-green-100 text-green-800 border-green-200',
      CANCELADO: 'bg-red-100 text-red-800 border-red-200',
    }
    return cores[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const obterCorTipo = (tipo) => {
    const cores = {
      0: 'bg-blue-100 text-blue-800 border-blue-200', // Orçamento
      1: 'bg-purple-100 text-purple-800 border-purple-200', // Pedido
    }
    return cores[tipo] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const obterLabelTipo = (tipo) => {
    const labels = {
      0: 'Orçamento',
      1: 'Pedido',
    }
    return labels[tipo] || 'Desconhecido'
  }

  const ehOrcamento = (pedido) => {
    return pedido.tipo === 0
  }

  const podeConverterOrcamento = (pedido) => {
    return pedido.tipo === 0 && pedido.status === 'ATIVO'
  }

  const obterLabelStatus = (status) => {
    const labels = {
      ATIVO: 'Ativo',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
    }
    return labels[status] || status
  }

  const obterIconeStatus = (status) => {
    const icones = {
      ATIVO: 'fa-clock',
      CONCLUIDO: 'fa-check-circle',
      CANCELADO: 'fa-times-circle',
    }
    return icones[status] || 'fa-circle'
  }

  const podeSerCancelado = (status) => {
    return status === 'ATIVO'
  }

  const podeSerConcluido = (status) => {
    return status === 'ATIVO'
  }

  const podeSerReativado = (status) => {
    return status === 'CANCELADO'
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
    listarPedidosComParametros,
    obterPedido,
    criarPedido,
    criarOrcamento,
    converterOrcamentoEmPedido,
    atualizarPedido,
    excluirPedido,
    cancelarPedido,
    concluirPedido,
    reativarPedido,
    carregarClientes,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,

    // Helpers
    obterCorStatus,
    obterCorTipo,
    obterLabelTipo,
    obterLabelStatus,
    obterIconeStatus,
    ehOrcamento,
    podeConverterOrcamento,
    podeSerCancelado,
    podeSerConcluido,
    podeSerReativado,
  }
})
