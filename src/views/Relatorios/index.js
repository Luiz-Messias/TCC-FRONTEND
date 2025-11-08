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

        // Carregar dados dos pedidos
        await pedidoStore.listarPedidosComParametros({
          dataInicio: dataInicio.value,
          dataFim: dataFim.value,
        })

        // Processar estatísticas de pedidos
        const pedidos = pedidoStore.pedidos
        estatisticasPedidos.value.totalPedidos = pedidos.filter((p) => p.tipo === 1).length
        estatisticasPedidos.value.totalOrcamentos = pedidos.filter((p) => p.tipo === 0).length
        estatisticasPedidos.value.pedidosAtivos = pedidos.filter((p) => p.status === 'ATIVO').length
        estatisticasPedidos.value.pedidosConcluidos = pedidos.filter(
          (p) => p.status === 'CONCLUIDO',
        ).length
        estatisticasPedidos.value.pedidosCancelados = pedidos.filter(
          (p) => p.status === 'CANCELADO',
        ).length

        const pedidosConcluidos = pedidos.filter((p) => p.status === 'CONCLUIDO')
        estatisticasPedidos.value.totalVendas = pedidosConcluidos.reduce(
          (sum, p) => sum + (p.valorTotal || 0),
          0,
        )
        estatisticasPedidos.value.ticketMedio =
          pedidosConcluidos.length > 0
            ? estatisticasPedidos.value.totalVendas / pedidosConcluidos.length
            : 0

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
      } finally {
        loading.value = false
      }
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
    }
  },
}
