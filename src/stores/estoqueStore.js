import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'
import { parseApiError } from '@/utils/parseApiError'

export const useEstoqueStore = defineStore('estoque', () => {
  // ===== ESTADO =====
  const saldos = ref([])
  const movimentacoes = ref([])
  const lotes = ref([])
  const estatisticas = ref(null)
  const carregando = ref(false)
  const carregandoModal = ref(false)

  // ===== PAGINAÇÃO - SALDOS =====
  const paginaAtualSaldos = ref(1)
  const itensPorPaginaSaldos = ref(10)
  const totalItensSaldos = ref(0)
  const ordenarPorSaldos = ref('nome')
  const direcaoSaldos = ref('asc')

  // ===== PAGINAÇÃO - MOVIMENTAÇÕES =====
  const paginaAtualMovimentacoes = ref(1)
  const itensPorPaginaMovimentacoes = ref(10)
  const totalItensMovimentacoes = ref(0)
  const ordenarPorMovimentacoes = ref('dataMovimentacao')
  const direcaoMovimentacoes = ref('desc')

  // ===== FILTROS - SALDOS =====
  const filtrosSaldos = ref({
    termo: '',
    categoriaId: null,
    status: null,
  })

  // ===== FILTROS - MOVIMENTAÇÕES =====
  const filtrosMovimentacoes = ref({
    produtoId: null,
    categoriaId: null,
    tipoMovimentacao: null,
    dataInicio: null,
    dataFim: null,
  })

  // ===== MODAL =====
  const modalAberto = ref(false)
  const produtoSelecionado = ref(null)

  // ===== COMPUTED =====
  const totalPaginasSaldos = computed(() =>
    Math.ceil(totalItensSaldos.value / itensPorPaginaSaldos.value),
  )

  const totalPaginasMovimentacoes = computed(() =>
    Math.ceil(totalItensMovimentacoes.value / itensPorPaginaMovimentacoes.value),
  )

  // ===== SALDOS - ACTIONS =====

  const listarSaldos = async () => {
    carregando.value = true
    try {
  const resposta = await api.get('/EstoqueSaldo')

      // ✅ CORRIGIDO: API retorna dados paginados dentro de resposta.data.data.items
      if (resposta.data?.success && resposta.data.data) {
        const dadosPaginados = resposta.data.data

        // Se retornar com paginação (items)
        if (dadosPaginados.items) {
          saldos.value = dadosPaginados.items
          totalItensSaldos.value = dadosPaginados.totalItems || dadosPaginados.items.length
        }
        // Se retornar array direto (sem paginação)
        else if (Array.isArray(dadosPaginados)) {
          saldos.value = dadosPaginados
          totalItensSaldos.value = dadosPaginados.length
        }
        // Se retornar objeto único
        else {
          saldos.value = [dadosPaginados]
          totalItensSaldos.value = 1
        }

        console.log('✅ Saldos carregados:', saldos.value.length, 'produtos')
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      console.error('❌ Erro ao listar saldos:', erro)
    } finally {
      carregando.value = false
    }
  }

  const buscarSaldo = async (produtoId) => {
    try {
  const resposta = await api.get(`/EstoqueSaldo/${produtoId}`)
      return resposta.data.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return null
    }
  }

  const atualizarConfiguracao = async (produtoId, dados) => {
    carregandoModal.value = true
    try {
      const payload = {
        estoqueMinimo: dados.estoqueMinimo,
        estoqueMaximo: dados.estoqueMaximo,
        valorUnitario: dados.valorUnitario,
      }
  const resposta = await api.put(`/EstoqueSaldo/${produtoId}/configuracao`, payload)

      toast.success('Configuração de estoque atualizada com sucesso')
      await listarSaldos()
      return resposta.data.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      throw erro
    } finally {
      carregandoModal.value = false
    }
  }

  const listarAlertas = async () => {
    try {
      const [baixos, criticos] = await Promise.all([
  api.get('/EstoqueSaldo/baixos'),
  api.get('/EstoqueSaldo/criticos'),
      ])
      return [
        ...(baixos.data.data || []).map((p) => ({ ...p, tipo: 'baixo' })),
        ...(criticos.data.data || []).map((p) => ({ ...p, tipo: 'critico' })),
      ]
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return []
    }
  }

  const aplicarFiltrosSaldos = (novosFiltros) => {
    filtrosSaldos.value = { ...filtrosSaldos.value, ...novosFiltros }
    paginaAtualSaldos.value = 1
    listarSaldos()
  }

  const limparFiltrosSaldos = () => {
    filtrosSaldos.value = {
      termo: '',
      categoriaId: null,
      status: null,
    }
    paginaAtualSaldos.value = 1
    listarSaldos()
  }

  const mudarPaginaSaldos = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginasSaldos.value) {
      paginaAtualSaldos.value = novaPagina
      listarSaldos()
    }
  }

  const mudarItensPorPaginaSaldos = (novoTamanho) => {
    itensPorPaginaSaldos.value = novoTamanho
    paginaAtualSaldos.value = 1
    listarSaldos()
  }

  const ordenarSaldos = (coluna) => {
    if (ordenarPorSaldos.value === coluna) {
      direcaoSaldos.value = direcaoSaldos.value === 'asc' ? 'desc' : 'asc'
    } else {
      ordenarPorSaldos.value = coluna
      direcaoSaldos.value = 'asc'
    }
    listarSaldos()
  }

  // ===== LOTES - ACTIONS =====

  const listarLotes = async (produtoId = null) => {
    try {
  const resposta = await api.get('/EstoqueLote')
      let lotesData = resposta.data.data || []

      if (produtoId) {
        lotesData = lotesData.filter((lote) => lote.produtoId === produtoId)
      }

      return lotesData
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return []
    }
  }

  const listarLotesPorProduto = async (produtoId) => {
    try {
  const resposta = await api.get(`/EstoqueLote/produto/${produtoId}`)
  const lotes = resposta.data.data || resposta.data || []
  // Mantém apenas lotes disponíveis quando propriedade existir
  return Array.isArray(lotes) ? lotes.filter((lote) => lote.ativo !== false) : []
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return []
    }
  }

  const listarVencimentos = async (dias = 30) => {
    try {
  const resposta = await api.get('/EstoqueLote/proximos-vencimento', {
        params: { dias },
      })
      return resposta.data.data || []
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return []
    }
  }

  // ===== MOVIMENTAÇÕES - ACTIONS =====

  const listarMovimentacoes = async () => {
    carregando.value = true
    try {
      const params = {
        pagina: paginaAtualMovimentacoes.value,
        itensPorPagina: itensPorPaginaMovimentacoes.value,
        ordenarPor: ordenarPorMovimentacoes.value,
        direcao: direcaoMovimentacoes.value,
        ...filtrosMovimentacoes.value,
      }

  const resposta = await api.get('/EstoqueMovimentacao', { params })

      if (resposta.data.data) {
        const pagedResult = resposta.data.data
        movimentacoes.value = pagedResult.items || []
        totalItensMovimentacoes.value = pagedResult.totalItems || 0
        paginaAtualMovimentacoes.value = pagedResult.currentPage || 1

        console.log('✅ Movimentações carregadas:', movimentacoes.value.length, 'registros')
      }
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
    } finally {
      carregando.value = false
    }
  }

  const registrarMovimentacao = async (dados, fecharModalAposSalvar = true) => {
    carregandoModal.value = true
    try {
  const resposta = await api.post('/EstoqueMovimentacao/registrar', dados)

      console.log('✅ Movimentação registrada:', resposta.data.data)

      if (fecharModalAposSalvar) {
        toast.success('Movimentação registrada com sucesso')
        fecharModal()
      }

      // ✅ ATUALIZAR LISTAS APÓS SUCESSO
      await Promise.all([listarMovimentacoes(), listarSaldos()])

      return resposta.data.data
    } catch (erro) {
      // ✅ MELHOR TRATAMENTO DE ERROS
      if (erro.response?.data?.data && Array.isArray(erro.response.data.data)) {
        // Erros de validação do backend vêm como array
        const erros = erro.response.data.data.join(', ')
        toast.error(erros)
      } else {
        const mensagem = parseApiError(erro)
        toast.error(mensagem)
      }

      console.error('❌ Erro ao registrar movimentação:', erro.response?.data || erro)
      throw erro
    } finally {
      carregandoModal.value = false
    }
  }

  const listarMovimentacoesRecentes = async (quantidade = 20) => {
    try {
  const resposta = await api.get('/EstoqueMovimentacao/recentes', {
        params: { quantidade },
      })
      return resposta.data.data || []
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return []
    }
  }

  const aplicarFiltrosMovimentacoes = (novosFiltros) => {
    filtrosMovimentacoes.value = {
      ...filtrosMovimentacoes.value,
      ...novosFiltros,
    }
    paginaAtualMovimentacoes.value = 1
    listarMovimentacoes()
  }

  const limparFiltrosMovimentacoes = () => {
    filtrosMovimentacoes.value = {
      produtoId: null,
      categoriaId: null,
      tipoMovimentacao: null,
      dataInicio: null,
      dataFim: null,
    }
    paginaAtualMovimentacoes.value = 1
    listarMovimentacoes()
  }

  const mudarPaginaMovimentacoes = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginasMovimentacoes.value) {
      paginaAtualMovimentacoes.value = novaPagina
      listarMovimentacoes()
    }
  }

  const mudarItensPorPaginaMovimentacoes = (novoTamanho) => {
    itensPorPaginaMovimentacoes.value = novoTamanho
    paginaAtualMovimentacoes.value = 1
    listarMovimentacoes()
  }

  const ordenarMovimentacoes = (coluna) => {
    if (ordenarPorMovimentacoes.value === coluna) {
      direcaoMovimentacoes.value = direcaoMovimentacoes.value === 'asc' ? 'desc' : 'asc'
    } else {
      ordenarPorMovimentacoes.value = coluna
      direcaoMovimentacoes.value = 'asc'
    }
    listarMovimentacoes()
  }

  // ===== DASHBOARD - ACTIONS =====

  const carregarEstatisticas = async () => {
    try {
  const resposta = await api.get('/EstoqueDashboard')
      estatisticas.value = resposta.data.data
      return resposta.data.data
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return null
    }
  }

  // ===== MODAL - ACTIONS =====

  const abrirModal = (produto = null) => {
    modalAberto.value = true
    produtoSelecionado.value = produto
  }

  const fecharModal = () => {
    modalAberto.value = false
    produtoSelecionado.value = null
  }

  // ===== VERIFICAÇÃO DE DISPONIBILIDADE =====

  const verificarDisponibilidade = async (produtoId, quantidadeDesejada) => {
    try {
  const resposta = await api.get(`/EstoqueSaldo/${produtoId}`)

      if (!resposta.data) {
        toast.error('Produto não encontrado no estoque')
        return {
          disponivel: false,
          mensagem: 'Produto não encontrado no estoque',
        }
      }

      const saldo = resposta.data.data || resposta.data

      if (!saldo || saldo.saldoAtual === undefined) {
        toast.error('Informação de estoque indisponível')
        return {
          disponivel: false,
          mensagem: 'Informação de estoque indisponível',
        }
      }

      if (saldo.saldoAtual < quantidadeDesejada) {
        toast.error(
          `Estoque insuficiente! Disponível: ${saldo.saldoAtual}, Solicitado: ${quantidadeDesejada}`,
        )
        return {
          disponivel: false,
          mensagem: `Estoque insuficiente. Disponível: ${saldo.saldoAtual} unidades`,
          saldoAtual: saldo.saldoAtual,
        }
      }

      return { disponivel: true, saldoAtual: saldo.saldoAtual }
    } catch (erro) {
      console.error('Erro ao verificar disponibilidade:', erro)

      // Se for erro 404, o produto não tem estoque cadastrado
      if (erro.response?.status === 404) {
        toast.error('Produto não possui estoque cadastrado')
        return {
          disponivel: false,
          mensagem: 'Produto sem estoque cadastrado',
        }
      }

      // Outros erros
      const mensagem = parseApiError(erro)
      toast.error(mensagem)
      return {
        disponivel: false,
        mensagem: 'Erro ao verificar disponibilidade',
      }
    }
  }

  const darBaixaAutomatica = async (pedidoId, itens) => {
    try {
      console.log('🔄 Iniciando baixa automática para pedido:', pedidoId)

      for (const item of itens) {
        // Dar baixa automática usando o endpoint de movimentação
        await registrarMovimentacao(
          {
            produtoId: item.produtoId,
            produtoNome: item.produtoNome || '',
            categoriaId: item.categoriaId || null,
            categoriaNome: item.categoriaNome || '',
            tipoMovimentacao: 'SAIDA',
            quantidade: item.quantidade,
            numeroLote: null,
            dataFabricacao: null,
            dataValidade: null,
            observacoes: pedidoId
              ? `Saída automática por pedido #${pedidoId}`
              : 'Saída automática por pedido',
            pedidoId: pedidoId || null,
          },
          false,
        ) // false = não fechar modal
      }

      console.log('✅ Baixa automática realizada para pedido:', pedidoId)
    } catch (erro) {
      const mensagem = parseApiError(erro)
      toast.error(`Erro ao dar baixa no estoque: ${mensagem}`)
      throw erro
    }
  }

  // ===== FUNÇÕES AUXILIARES =====

  const obterStatusEstoque = (saldo) => {
    if (!saldo || saldo.saldoAtual === undefined) return 'OK'

    if (saldo.estoqueMinimo && saldo.saldoAtual <= saldo.estoqueMinimo) {
      return 'CRITICO'
    }

    if (saldo.estoqueMinimo && saldo.saldoAtual <= saldo.estoqueMinimo * 1.5) {
      return 'BAIXO'
    }

    return 'OK'
  }

  const obterCorStatus = (status) => {
    const cores = {
      OK: 'text-green-600',
      BAIXO: 'text-yellow-600',
      CRITICO: 'text-red-600',
    }
    return cores[status] || 'text-gray-600'
  }

  const obterIconeStatus = (status) => {
    const icones = {
      OK: 'fa-check-circle',
      BAIXO: 'fa-exclamation-triangle',
      CRITICO: 'fa-times-circle',
    }
    return icones[status] || 'fa-circle'
  }

  const obterLabelStatus = (status) => {
    const labels = {
      OK: 'Estoque OK',
      BAIXO: 'Estoque Baixo',
      CRITICO: 'Estoque Crítico',
    }
    return labels[status] || 'Desconhecido'
  }

  const obterCorProgresso = (status) => {
    const cores = {
      OK: 'bg-green-500',
      BAIXO: 'bg-yellow-500',
      CRITICO: 'bg-red-500',
    }
    return cores[status] || 'bg-gray-500'
  }

  const obterProgresso = (saldo) => {
    if (!saldo || !saldo.estoqueMaximo) return 0

    const progresso = (saldo.saldoAtual / saldo.estoqueMaximo) * 100
    return Math.min(Math.max(progresso, 0), 100) // Limita entre 0 e 100
  }

  return {
    // Estado
    saldos,
    movimentacoes,
    lotes,
    estatisticas,
    carregando,
    carregandoModal,

    // Paginação - Saldos
    paginaAtualSaldos,
    itensPorPaginaSaldos,
    totalItensSaldos,
    totalPaginasSaldos,
    ordenarPorSaldos,
    direcaoSaldos,
    filtrosSaldos,

    // Paginação - Movimentações
    paginaAtualMovimentacoes,
    itensPorPaginaMovimentacoes,
    totalItensMovimentacoes,
    totalPaginasMovimentacoes,
    ordenarPorMovimentacoes,
    direcaoMovimentacoes,
    filtrosMovimentacoes,

    // Modal
    modalAberto,
    produtoSelecionado,

    // Actions - Saldos
    listarSaldos,
    buscarSaldo,
    atualizarConfiguracao,
    listarAlertas,
    aplicarFiltrosSaldos,
    limparFiltrosSaldos,
    mudarPaginaSaldos,
    mudarItensPorPaginaSaldos,
    ordenarSaldos,

    // Actions - Lotes
    listarLotes,
    listarLotesPorProduto,
    listarVencimentos,

    // Actions - Movimentações
    listarMovimentacoes,
    registrarMovimentacao,
    listarMovimentacoesRecentes,
    aplicarFiltrosMovimentacoes,
    limparFiltrosMovimentacoes,
    mudarPaginaMovimentacoes,
    mudarItensPorPaginaMovimentacoes,
    ordenarMovimentacoes,

    // Actions - Dashboard
    carregarEstatisticas,

    // Actions - Modal
    abrirModal,
    fecharModal,

    // Actions - Integração
    verificarDisponibilidade,
    darBaixaAutomatica,

    // Funções Auxiliares
    obterStatusEstoque,
    obterCorStatus,
    obterIconeStatus,
    obterLabelStatus,
    obterCorProgresso,
    obterProgresso,
  }
})
