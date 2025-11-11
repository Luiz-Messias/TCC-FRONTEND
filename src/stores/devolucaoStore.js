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

      let items = []
      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        items = pagedResult.items || []
        totalItens.value = pagedResult.totalItems || 0
        paginaAtual.value = pagedResult.currentPage || 1
      } else {
        items = resposta.data.items || resposta.data || []
        totalItens.value = resposta.data.totalItems || items.length || 0
      }

      // Mapear dados para formato correto
      devolucoes.value = await Promise.all(
        items.map(async (dev) => {
          // Buscar nome do cliente se tiver clienteId
          let clienteNome = '-'
          if (dev.clienteId) {
            try {
              const clienteResp = await api.get(`/cliente/${dev.clienteId}`)
              clienteNome = clienteResp.data.data?.nome || clienteResp.data?.nome || '-'
            } catch (e) {
              console.warn('Erro ao buscar cliente:', e)
            }
          }

          // Buscar nome do produto
          let produtoNome = '-'
          if (dev.produtoId) {
            try {
              const produtoResp = await api.get(`/produto/${dev.produtoId}`)
              produtoNome = produtoResp.data.data?.nome || produtoResp.data?.nome || '-'
            } catch (e) {
              console.warn('Erro ao buscar produto:', e)
            }
          }

          // Converter status numérico para texto
          const statusMap = {
            0: 'PENDENTE',
            1: 'APROVADA',
            2: 'RECUSADA',
            3: 'PROCESSADA',
          }

          return {
            ...dev,
            clienteNome,
            produtoNome,
            status: statusMap[dev.status] || dev.status,
            dataDevolucao: dev.dataDevolucao || dev.dataCriacao || new Date().toISOString(),
            motivo: dev.motivo || 'Não informado',
          }
        }),
      )
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

  const recusarDevolucao = async (id, motivo) => {
    try {
      // API exige motivo obrigatório para recusar
      await api.patch(`/devolucao/${id}/recusar`, JSON.stringify(motivo), {
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success('Devolução recusada!')
      await listarDevolucoes()
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    }
  }

  const processarDevolucao = async (id, observacao = null) => {
    try {
      // Processa devolução aprovada e devolve ao estoque
      await api.patch(
        `/devolucao/${id}/processar`,
        observacao ? JSON.stringify(observacao) : null,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      toast.success('Devolução processada com sucesso!')
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
      const params = {
        pagina: 1,
        itensPorPagina: 1000,
        ordenarPor: 'dataPedido',
        direcao: 'desc',
      }

      const resposta = await api.get('/pedido', { params })

      let todosPedidos = []

      // Usa o mesmo padrão do pedidoStore
      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        todosPedidos = pagedResult.items || []
        console.log('✅ Total de pedidos retornados:', pagedResult.totalItems)
      } else {
        todosPedidos = resposta.data.items || resposta.data || []
      }

      // Busca informações dos clientes
      const clientesResponse = await api.get('/cliente', { params: { itensPorPagina: 1000 } })
      const clientesData =
        clientesResponse.data.data?.items ||
        clientesResponse.data.items ||
        clientesResponse.data ||
        []

      // Cria um mapa de clientes para acesso rápido
      const clientesMap = {}
      clientesData.forEach((cliente) => {
        clientesMap[cliente.id] = cliente.nome
      })

      // Adiciona o nome do cliente e filtra pedidos
      pedidos.value = todosPedidos
        .filter(
          (pedido) =>
            pedido.status !== 'CANCELADO' &&
            pedido.status !== 'Cancelado' &&
            pedido.itens &&
            pedido.itens.length > 0,
        )
        .map((pedido) => ({
          ...pedido,
          clienteNome: clientesMap[pedido.clienteId] || 'Cliente não encontrado',
        }))

      console.log('✅ Pedidos disponíveis:', pedidos.value.length)
      if (pedidos.value.length > 0) {
        console.log('✅ Primeiro pedido:', pedidos.value[0])
      }
    } catch (erro) {
      console.error('❌ Erro ao carregar pedidos:', erro)
      const mensagem = parseApiError(erro)
      toast.error('Erro ao carregar pedidos: ' + mensagem)
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
  const converterStatus = (statusNumerico) => {
    const statusMap = {
      0: 'PENDENTE',
      1: 'APROVADA',
      2: 'RECUSADA',
      3: 'PROCESSADA',
    }
    return statusMap[statusNumerico] || statusNumerico
  }

  const obterCorStatus = (status) => {
    const statusTexto = typeof status === 'number' ? converterStatus(status) : status
    const cores = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      APROVADA: 'bg-green-100 text-green-800',
      RECUSADA: 'bg-red-100 text-red-800',
      PROCESSADA: 'bg-blue-100 text-blue-800',
    }
    return cores[statusTexto] || 'bg-gray-100 text-gray-800'
  }

  const obterIconeStatus = (status) => {
    const statusTexto = typeof status === 'number' ? converterStatus(status) : status
    const icones = {
      PENDENTE: 'fa-clock',
      APROVADA: 'fa-check-circle',
      RECUSADA: 'fa-times-circle',
      PROCESSADA: 'fa-sync',
    }
    return icones[statusTexto] || 'fa-circle'
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
    processarDevolucao,
    excluirDevolucao,
    carregarPedidosConcluidos,
    abrirModal,
    fecharModal,
    aplicarFiltros,
    limparFiltros,
    alterarOrdenacao,

    // Funções auxiliares
    converterStatus,
    obterCorStatus,
    obterIconeStatus,
  }
})
