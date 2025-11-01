import { ref, computed, onMounted } from 'vue'
import { useEstoqueStore } from '@/stores/estoqueStore'

export default {
  name: 'EstoqueDashboardView',
  setup() {
    const estoqueStore = useEstoqueStore()

    const alertas = ref([])
    const vencimentos = ref([])
    const movimentacoesRecentes = ref([])

    // Computed - Estatísticas
    const totalProdutos = computed(
      () => estoqueStore.estatisticas?.totalProdutosComEstoque || 0,
    )
    const valorTotal = computed(() => estoqueStore.estatisticas?.valorTotalEstoque || 0)
    const produtosBaixos = computed(() => alertas.value.filter((a) => a.tipo === 'baixo'))
    const produtosCriticos = computed(() => alertas.value.filter((a) => a.tipo === 'critico'))
    const produtosVencimento = computed(() => vencimentos.value)

    // Métodos de formatação
    const formatarMoeda = (valor) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor)
    }

    const formatarData = (data) => {
      return new Date(data).toLocaleDateString('pt-BR')
    }

    const formatarHora = (data) => {
      return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const getIconeTipo = (tipo) => {
      switch (tipo) {
        case 'ENTRADA':
          return 'fa-arrow-up text-green-600'
        case 'SAIDA':
          return 'fa-arrow-down text-red-600'
        case 'AJUSTE':
          return 'fa-wrench text-yellow-600'
        default:
          return 'fa-circle text-gray-600'
      }
    }

    const getLabelTipo = (tipo) => {
      switch (tipo) {
        case 'ENTRADA':
          return 'Entrada'
        case 'SAIDA':
          return 'Saída'
        case 'AJUSTE':
          return 'Ajuste'
        default:
          return tipo
      }
    }

    const carregarDados = async () => {
      try {
        // Carregar estatísticas do dashboard
        await estoqueStore.carregarEstatisticas()

        // Carregar alertas
        alertas.value = await estoqueStore.listarAlertas()

        // Carregar lotes próximos ao vencimento
        vencimentos.value = await estoqueStore.listarVencimentos(30)

        // Carregar movimentações recentes
        movimentacoesRecentes.value = await estoqueStore.listarMovimentacoesRecentes()
      } catch (erro) {
        console.error('Erro ao carregar dados do dashboard:', erro)
      }
    }

    // Lifecycle
    onMounted(() => {
      carregarDados()
    })

    return {
      // Store
      estoqueStore,

      // Computed
      totalProdutos,
      valorTotal,
      produtosBaixos,
      produtosCriticos,
      produtosVencimento,
      movimentacoesRecentes,

      // Métodos
      formatarMoeda,
      formatarData,
      formatarHora,
      getIconeTipo,
      getLabelTipo,
      carregarDados,
    }
  },
}
