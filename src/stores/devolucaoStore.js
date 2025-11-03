import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useDevolucaoStore = defineStore('devolucao', () => {
  // Estado
  const devolucoes = ref([])
  const devolucao = ref({
    id: null,
    pedidoId: null,
    clienteNome: '',
    dataDevolucao: new Date().toISOString().split('T')[0],
    motivo: '',
    observacoes: '',
    status: 'PENDENTE',
    itens: [],
    valorTotal: 0,
  })

  const pedidos = ref([])
  const loading = ref(false)
  const modalAberto = ref(false)
  const modoEdicao = ref(false)

  // Paginação e filtros
  const paginaAtual = ref(1)
  const itensPorPagina = ref(10)
  const totalItens = ref(0)
  const termoBusca = ref('')
  const filtroStatus = ref('')
  const ordenacao = ref({ campo: 'dataDevolucao', direcao: 'desc' })

  // Computados
  const totalPaginas = computed(() => Math.ceil(totalItens.value / itensPorPagina.value))

  // Ações
  const listarDevolucoes = async () => {
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

      const resposta = await api.get('/devolucao', { params })

      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        devolucoes.value = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        devolucoes.value = resposta.data.items || resposta.data || []
        totalItens.value = resposta.data.totalItems || resposta.data.length || 0
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      console.error('Erro ao listar devoluções:', erro)
    } finally {
      loading.value = false
    }
  }

  const obterDevolucao = async (id) => {
    try {
      const resposta = await api.get(`/devolucao/${id}`)
      return resposta.data.data || resposta.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const criarDevolucao = async (dadosDevolucao) => {
    loading.value = true
    try {
      const resposta = await api.post('/devolucao', dadosDevolucao)
      toast.success('Devolução registrada com sucesso!')
      await listarDevolucoes()
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

  const atualizarDevolucao = async (id, dadosDevolucao) => {
    loading.value = true
    try {
      const resposta = await api.put(`/devolucao/${id}`, dadosDevolucao)
      toast.success('Devolução atualizada com sucesso!')
      await listarDevolucoes()
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

  const aprovarDevolucao = async (id) => {
    try {
      await api.patch(`/devolucao/${id}/aprovar`)
      toast.success('Devolução aprovada com sucesso!')
      await listarDevolucoes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const recusarDevolucao = async (id) => {
    try {
      await api.patch(`/devolucao/${id}/recusar`)
      toast.success('Devolução recusada!')
      await listarDevolucoes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const excluirDevolucao = async (id) => {
    try {
      await api.delete(`/devolucao/${id}`)
      toast.success('Devolução excluída com sucesso!')
      await listarDevolucoes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const carregarPedidosConcluidos = async () => {
    try {
      const resposta = await api.get('/pedido', {
        params: { status: 'CONCLUIDO' },
      })
      pedidos.value = resposta.data.data?.items || resposta.data.items || resposta.data || []
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro)
      pedidos.value = []
    }
  }

  // Modal
  const abrirModal = (devolucaoParaEditar = null) => {
    if (devolucaoParaEditar) {
      devolucao.value = { ...devolucaoParaEditar }
      modoEdicao.value = true
    } else {
      devolucao.value = {
        id: null,
        pedidoId: null,
        clienteNome: '',
        dataDevolucao: new Date().toISOString().split('T')[0],
        motivo: '',
        observacoes: '',
        status: 'PENDENTE',
        itens: [],
        valorTotal: 0,
      }
      modoEdicao.value = false
    }
    modalAberto.value = true
  }

  const fecharModal = () => {
    modalAberto.value = false
    modoEdicao.value = false
    devolucao.value = {
      id: null,
      pedidoId: null,
      clienteNome: '',
      dataDevolucao: new Date().toISOString().split('T')[0],
      motivo: '',
      observacoes: '',
      status: 'PENDENTE',
      itens: [],
      valorTotal: 0,
    }
  }

  // Filtros e busca
  const aplicarFiltros = () => {
    paginaAtual.value = 1
    listarDevolucoes()
  }

  const limparFiltros = () => {
    termoBusca.value = ''
    filtroStatus.value = ''
    paginaAtual.value = 1
    listarDevolucoes()
  }

  const alterarOrdenacao = (campo) => {
    if (ordenacao.value.campo === campo) {
      ordenacao.value.direcao = ordenacao.value.direcao === 'asc' ? 'desc' : 'asc'
    } else {
      ordenacao.value.campo = campo
      ordenacao.value.direcao = 'asc'
    }
    listarDevolucoes()
  }

  // Funções auxiliares
  const obterCorStatus = (status) => {
    const cores = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      APROVADA: 'bg-green-100 text-green-800',
      RECUSADA: 'bg-red-100 text-red-800',
      PROCESSADA: 'bg-blue-100 text-blue-800',
    }
    return cores[status] || 'bg-gray-100 text-gray-800'
  }

  const obterIconeStatus = (status) => {
    const icones = {
      PENDENTE: 'fa-clock',
      APROVADA: 'fa-check-circle',
      RECUSADA: 'fa-times-circle',
      PROCESSADA: 'fa-sync',
    }
    return icones[status] || 'fa-circle'
  }

  return {
    // Estado
    devolucoes,
    devolucao,
    pedidos,
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
    listarDevolucoes,
    obterDevolucao,
    criarDevolucao,
    atualizarDevolucao,
    aprovarDevolucao,
    recusarDevolucao,
    excluirDevolucao,
    carregarPedidosConcluidos,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,

    // Funções auxiliares
    obterCorStatus,
    obterIconeStatus,
  }
})
