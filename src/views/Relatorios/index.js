import { ref, onMounted, computed } from 'vue'
import { usePedidoStore } from '@/stores/pedidoStore'
import { useProdutoStore } from '@/stores/produtoStore'
import { useEstoqueStore } from '@/stores/estoqueStore'

export default {
  name: 'RelatoriosView',
  setup() {
    const pedidoStore = usePedidoStore()
    const produtoStore = useProdutoStore()
    const estoqueStore = useEstoqueStore()

    const loading = ref(false)
    const periodoSelecionado = ref('mes') // mes, trimestre, ano
    const dataInicio = ref('')
    const dataFim = ref('')

    // Dados dos relatórios
    const estatisticasPedidos = ref({
      totalPedidos: 0,
      totalOrcamentos: 0,
      totalVendas: 0,
      ticketMedio: 0,
      pedidosAtivos: 0,
      pedidosConcluidos: 0,
      pedidosCancelados: 0,
    })

    const estatisticasProdutos = ref({
      totalProdutos: 0,
      produtosAtivos: 0,
      produtosInativos: 0,
      valorTotalEstoque: 0,
    })

    const estatisticasEstoque = ref({
      produtosBaixoEstoque: 0,
      produtosCriticos: 0,
      movimentacoesRecentes: [],
      produtosMaisVendidos: [],
    })

    const topProdutos = ref([])
    const movimentacoesRecentes = ref([])

    // Computados
    const periodoFormatado = computed(() => {
      if (dataInicio.value && dataFim.value) {
        return `${new Date(dataInicio.value).toLocaleDateString('pt-BR')} - ${new Date(dataFim.value).toLocaleDateString('pt-BR')}`
      }

      const periodos = {
        mes: 'Últimos 30 dias',
        trimestre: 'Últimos 90 dias',
        ano: 'Último ano',
      }
      return periodos[periodoSelecionado.value] || 'Período personalizado'
    })

    // Métodos
    const calcularPeriodo = () => {
      const hoje = new Date()
      let dias = 30

      if (periodoSelecionado.value === 'trimestre') dias = 90
      if (periodoSelecionado.value === 'ano') dias = 365

      const inicio = new Date()
      inicio.setDate(hoje.getDate() - dias)

      dataInicio.value = inicio.toISOString().split('T')[0]
      dataFim.value = hoje.toISOString().split('T')[0]
    }

    const carregarRelatorios = async () => {
      loading.value = true
      try {
        calcularPeriodo()

        // Carregar TODOS os pedidos primeiro
        await pedidoStore.listarPedidos()

        // Processar estatísticas de pedidos
        const pedidos = pedidoStore.pedidos

        // Mapear status numérico para string se necessário
        const statusMap = {
          0: 'ATIVO',
          1: 'CONCLUIDO',
          2: 'CANCELADO',
        }

        // Normalizar pedidos
        const pedidosNormalizados = pedidos.map((p) => ({
          ...p,
          status: typeof p.status === 'number' ? statusMap[p.status] : p.status,
          tipo: typeof p.tipo === 'number' ? p.tipo : p.tipo === 'PEDIDO' ? 1 : 0,
        }))

        // Tipo: 0 = Orçamento, 1 = Pedido
        const orcamentos = pedidosNormalizados.filter((p) => p.tipo === 0 || p.tipo === 'ORCAMENTO')
        const pedidosVenda = pedidosNormalizados.filter((p) => p.tipo === 1 || p.tipo === 'PEDIDO')

        estatisticasPedidos.value.totalOrcamentos = orcamentos.length
        estatisticasPedidos.value.totalPedidos = pedidosVenda.length
        const ativos = pedidosNormalizados.filter((p) => p.status === 'ATIVO' || p.status === 0)
        const concluidos = pedidosNormalizados.filter(
          (p) => p.status === 'CONCLUIDO' || p.status === 1,
        )
        const cancelados = pedidosNormalizados.filter(
          (p) => p.status === 'CANCELADO' || p.status === 2,
        )

        estatisticasPedidos.value.pedidosAtivos = ativos.length
        estatisticasPedidos.value.pedidosConcluidos = concluidos.length
        estatisticasPedidos.value.pedidosCancelados = cancelados.length

        // Apenas pedidos concluídos contam para vendas (não orçamentos!)
        const pedidosConcluidos = pedidosNormalizados.filter((p) => {
          const statusConcluido = p.status === 'CONCLUIDO' || p.status === 1
          const ehPedido = p.tipo === 1 || p.tipo === 'PEDIDO'
          return statusConcluido && ehPedido
        })

        let totalVendas = 0
        pedidosConcluidos.forEach((p) => {
          const valor = parseFloat(p.total || p.valorTotal) || 0
          totalVendas += valor
        })

        const ticketMedio =
          pedidosConcluidos.length > 0 ? totalVendas / pedidosConcluidos.length : 0

        estatisticasPedidos.value.totalVendas = totalVendas
        estatisticasPedidos.value.ticketMedio = ticketMedio

        // Carregar produtos
        await produtoStore.listarProdutos()
        const produtos = produtoStore.produtos
        estatisticasProdutos.value.totalProdutos = produtos.length
        estatisticasProdutos.value.produtosAtivos = produtos.filter((p) => p.ativo).length
        estatisticasProdutos.value.produtosInativos = produtos.filter((p) => !p.ativo).length

        // Carregar estatísticas de estoque
        const alertas = await estoqueStore.listarAlertas()
        estatisticasEstoque.value.produtosBaixoEstoque = alertas.filter(
          (a) => a.tipo === 'baixo',
        ).length
        estatisticasEstoque.value.produtosCriticos = alertas.filter(
          (a) => a.tipo === 'critico',
        ).length

        // Movimentações recentes
        movimentacoesRecentes.value = await estoqueStore.listarMovimentacoesRecentes(10)

        // Top produtos (mock - ajustar conforme API)
        topProdutos.value = produtos
          .slice(0, 5)
          .map((p) => ({
            nome: p.nome,
            vendas: Math.floor(Math.random() * 100),
            receita: Math.floor(Math.random() * 10000),
          }))
          .sort((a, b) => b.vendas - a.vendas)
      } catch (erro) {
        console.error('Erro ao carregar relatórios:', erro)

        // Resetar para valores padrão em caso de erro
        estatisticasPedidos.value = {
          totalPedidos: 0,
          totalOrcamentos: 0,
          totalVendas: 0,
          ticketMedio: 0,
          pedidosAtivos: 0,
          pedidosConcluidos: 0,
          pedidosCancelados: 0,
        }
      } finally {
        loading.value = false
      }
    }

    const formatarMoeda = (valor) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor || 0)
    }

    const exportarPDF = () => {
      alert('Funcionalidade de exportação em desenvolvimento')
    }

    const exportarExcel = () => {
      alert('Funcionalidade de exportação em desenvolvimento')
    }

    onMounted(() => {
      carregarRelatorios()
    })

    return {
      loading,
      periodoSelecionado,
      dataInicio,
      dataFim,
      periodoFormatado,
      estatisticasPedidos,
      estatisticasProdutos,
      estatisticasEstoque,
      topProdutos,
      movimentacoesRecentes,
      carregarRelatorios,
      exportarPDF,
      exportarExcel,
      formatarMoeda,
    }
  },
}
