import { ref, computed, onMounted } from 'vue'
import { useEstoqueStore } from '@/stores/estoqueStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import MovimentacaoModal from '@/components/Movimentacao/MovimentacaoModal.vue'

export default {
  name: 'EstoqueSaldosView',
  components: {
    MovimentacaoModal,
  },
  setup() {
    const estoqueStore = useEstoqueStore()
    const categoriaStore = useCategoriaStore()

    // Estado local
    const mostrarModal = ref(false)
    const produtoParaMovimentar = ref(null)
    const filtroLocal = ref({
      produtoNome: '',
      categoriaId: null,
      status: null,
    })

    // Computed
    const saldosFiltrados = computed(() => estoqueStore.saldos)
    const categorias = computed(() => categoriaStore.categorias)

    const statusOptions = [
      { value: 'OK', label: 'Normal', color: 'text-green-600' },
      { value: 'BAIXO', label: 'Estoque Baixo', color: 'text-yellow-600' },
      { value: 'CRITICO', label: 'Crítico', color: 'text-red-600' },
    ]

    // Métodos
    const aplicarFiltros = () => {
      estoqueStore.aplicarFiltrosSaldos(filtroLocal.value)
    }

    const limparFiltros = () => {
      filtroLocal.value = {
        produtoNome: '',
        categoriaId: null,
        status: null,
      }
      estoqueStore.limparFiltrosSaldos()
    }

    const abrirModalMovimentacao = (saldo = null) => {
      produtoParaMovimentar.value = saldo
      mostrarModal.value = true
    }

    const fecharModal = () => {
      mostrarModal.value = false
      produtoParaMovimentar.value = null
    }

    const movimentacaoSalva = () => {
      // Recarregar dados se necessário
      estoqueStore.listarSaldos()
    }

    const formatarMoeda = (valor) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor)
    }

    const formatarData = (data) => {
      return new Date(data).toLocaleDateString('pt-BR')
    }

    const calcularValorTotal = (saldo) => {
      return saldo.saldoAtual * saldo.valorUnitario
    }

    const obterProgresso = (saldo) => {
      const percentual = (saldo.saldoAtual / saldo.estoqueMaximo) * 100
      return Math.min(percentual, 100)
    }

    const obterCorProgresso = (status) => {
      switch (status) {
        case 'OK':
          return 'bg-green-500'
        case 'BAIXO':
          return 'bg-yellow-500'
        case 'CRITICO':
          return 'bg-red-500'
        default:
          return 'bg-gray-500'
      }
    }

    const obterIconeLote = (diasRestantes) => {
      if (diasRestantes <= 30) return 'fa-exclamation-triangle text-red-500'
      if (diasRestantes <= 60) return 'fa-exclamation-circle text-yellow-500'
      return 'fa-check-circle text-green-500'
    }

    const calcularDiasParaVencimento = (dataValidade) => {
      const hoje = new Date()
      const validade = new Date(dataValidade)
      const diff = validade - hoje
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    // Lifecycle
    onMounted(async () => {
      await estoqueStore.listarSaldos()
      await categoriaStore.listarCategorias()
    })

    return {
      // Estado
      estoqueStore,
      mostrarModal,
      produtoParaMovimentar,
      filtroLocal,

      // Computed
      saldosFiltrados,
      categorias,
      statusOptions,

      // Métodos
      aplicarFiltros,
      limparFiltros,
      abrirModalMovimentacao,
      fecharModal,
      movimentacaoSalva,
      formatarMoeda,
      formatarData,
      calcularValorTotal,
      obterProgresso,
      obterCorProgresso,
      obterIconeLote,
      calcularDiasParaVencimento,
    }
  },
}
