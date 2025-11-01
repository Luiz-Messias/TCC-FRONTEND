import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePedidoStore } from '@/stores/pedidoStore'
import { useProdutoStore } from '@/stores/produtoStore'
import { useRouter } from 'vue-router'

export default {
  name: 'PedidosView',
  setup() {
    const router = useRouter()
    const pedidoStore = usePedidoStore()
    const produtoStore = useProdutoStore()

    const pedidoParaExcluir = ref(null)
    const pedidoParaCancelar = ref(null)
    const pedidoParaConcluir = ref(null)
    const pedidoParaReativar = ref(null)
    const pedidoParaConverter = ref(null)
    const pedidoDetalhes = ref(null)

    const {
      pedidos,
      clientes,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      ordenacao,
    } = storeToRefs(pedidoStore)

    const { produtos } = storeToRefs(produtoStore)

    const {
      listarPedidos,
      excluirPedido,
      cancelarPedido,
      concluirPedido,
      reativarPedido,
      carregarClientes,
      alterarOrdenacao,
    } = pedidoStore
    const { listarProdutos } = produtoStore

    // Filtros locais
    const filtroCliente = ref(null)
    const filtroTipo = ref(null)
    const filtroStatus = ref(null)
    const dataInicio = ref('')
    const dataFim = ref('')

    // Métodos
    const aplicarFiltros = async () => {
      paginaAtual.value = 1
      await listarPedidosComFiltros()
    }

    const limparFiltros = async () => {
      filtroCliente.value = null
      filtroStatus.value = null
      dataInicio.value = ''
      dataFim.value = ''
      paginaAtual.value = 1
      await listarPedidosComFiltros()
    }

    const listarPedidosComFiltros = async () => {
      loading.value = true
      try {
        const params = {
          pagina: paginaAtual.value,
          itensPorPagina: itensPorPagina.value,
          clienteId: filtroCliente.value,
          status: filtroStatus.value,
          dataInicio: dataInicio.value || null,
          dataFim: dataFim.value || null,
          ordenarPor: ordenacao.value.campo,
          direcao: ordenacao.value.direcao,
        }

        await pedidoStore.listarPedidosComParametros(params)
      } finally {
        loading.value = false
      }
    }

    const verDetalhes = (pedido) => {
      pedidoDetalhes.value = pedido
    }

    const fecharDetalhes = () => {
      pedidoDetalhes.value = null
    }

    const confirmarExclusao = (pedido) => {
      pedidoParaExcluir.value = pedido
    }

    const excluirPedidoConfirmado = async () => {
      if (pedidoParaExcluir.value) {
        try {
          await excluirPedido(pedidoParaExcluir.value.pedidoId)
          await listarPedidosComFiltros()
        } finally {
          pedidoParaExcluir.value = null
        }
      }
    }

    const confirmarCancelamento = (pedido) => {
      pedidoParaCancelar.value = pedido
    }

    const cancelarPedidoConfirmado = async () => {
      if (pedidoParaCancelar.value) {
        try {
          await cancelarPedido(pedidoParaCancelar.value.pedidoId)
          await listarPedidosComFiltros()
        } finally {
          pedidoParaCancelar.value = null
        }
      }
    }

    const confirmarConclusao = (pedido) => {
      pedidoParaConcluir.value = pedido
    }

    const concluirPedidoConfirmado = async () => {
      if (pedidoParaConcluir.value) {
        try {
          await concluirPedido(pedidoParaConcluir.value.pedidoId)
          await listarPedidosComFiltros()
        } finally {
          pedidoParaConcluir.value = null
        }
      }
    }

    const confirmarReativacao = (pedido) => {
      pedidoParaReativar.value = pedido
    }

    const reativarPedidoConfirmado = async () => {
      if (pedidoParaReativar.value) {
        try {
          await reativarPedido(pedidoParaReativar.value.pedidoId)
          await listarPedidosComFiltros()
        } finally {
          pedidoParaReativar.value = null
        }
      }
    }

    const confirmarConversao = (pedido) => {
      pedidoParaConverter.value = pedido
    }

    const converterOrcamentoConfirmado = async () => {
      if (pedidoParaConverter.value) {
        try {
          await pedidoStore.converterOrcamentoEmPedido(pedidoParaConverter.value.pedidoId)
          await listarPedidosComFiltros()
        } finally {
          pedidoParaConverter.value = null
        }
      }
    }

    const irParaNovoPedido = () => {
      router.push('/pedido/novo')
    }

    const obterNomeCliente = (clienteId) => {
      const cliente = clientes.value.find((c) => c.id === clienteId)
      return cliente?.nome || 'Cliente não encontrado'
    }

    const obterNomeProduto = (produtoId) => {
      const produto = produtos.value.find((p) => p.id === produtoId)
      return produto?.nome || 'Produto não encontrado'
    }

    const formatarMoeda = (valor) => {
      return valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'
    }

    const formatarData = (data) => {
      if (!data) return '-'
      return new Date(data).toLocaleDateString('pt-BR')
    }

    const formatarHora = (data) => {
      if (!data) return '-'
      return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatarDataCompleta = (data) => {
      if (!data) return '-'
      return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatarId = (id) => {
      if (!id) return '-'
      // Pega apenas os primeiros 8 caracteres do UUID
      return id.toString().substring(0, 8).toUpperCase()
    }

    const gerarPaginas = () => {
      const paginas = []
      const maxPaginas = 5
      const metade = Math.floor(maxPaginas / 2)

      let inicio = Math.max(1, paginaAtual.value - metade)
      let fim = Math.min(totalPaginas.value, inicio + maxPaginas - 1)

      if (fim - inicio < maxPaginas - 1) {
        inicio = Math.max(1, fim - maxPaginas + 1)
      }

      if (inicio > 1) {
        paginas.push(1)
        if (inicio > 2) paginas.push('...')
      }

      for (let i = inicio; i <= fim; i++) {
        paginas.push(i)
      }

      if (fim < totalPaginas.value) {
        if (fim < totalPaginas.value - 1) paginas.push('...')
        paginas.push(totalPaginas.value)
      }

      return paginas
    }

    // Inicialização
    onMounted(async () => {
      await Promise.all([carregarClientes(), listarProdutos(), listarPedidosComFiltros()])
    })

    return {
      // Estado
      pedidos,
      clientes,
      produtos,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      ordenacao,
      filtroCliente,
      filtroTipo,
      filtroStatus,
      dataInicio,
      dataFim,
      pedidoParaExcluir,
      pedidoParaCancelar,
      pedidoParaConcluir,
      pedidoParaReativar,
      pedidoParaConverter,
      pedidoDetalhes,
      pedidoStore,

      // Métodos
      listarPedidos: listarPedidosComFiltros,
      aplicarFiltros,
      limparFiltros,
      verDetalhes,
      fecharDetalhes,
      confirmarExclusao,
      excluirPedidoConfirmado,
      confirmarCancelamento,
      cancelarPedidoConfirmado,
      confirmarConclusao,
      concluirPedidoConfirmado,
      confirmarReativacao,
      reativarPedidoConfirmado,
      confirmarConversao,
      converterOrcamentoConfirmado,
      irParaNovoPedido,
      alterarOrdenacao,
      obterNomeCliente,
      obterNomeProduto,
      formatarMoeda,
      formatarData,
      formatarHora,
      formatarDataCompleta,
      formatarId,
      gerarPaginas,
    }
  },
}
