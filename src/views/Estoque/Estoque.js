import { onMounted, ref, computed } from 'vue'
import { useEstoqueStore } from '@/stores/estoqueStore'
import { useProdutoStore } from '@/stores/produtoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import MovimentacaoModal from '@/components/Movimentacao/MovimentacaoModal.vue'

export default {
  name: 'EstoqueView',
  components: {
    MovimentacaoModal,
  },
  setup() {
    const estoqueStore = useEstoqueStore()
    const produtoStore = useProdutoStore()
    const categoriaStore = useCategoriaStore()

    // Estado local
    const mostrarModal = ref(false)

    // Filtros locais
    const filtroLocal = ref({
      produtoId: null,
      categoriaId: null,
      tipoMovimentacao: null,
      dataInicio: null,
      dataFim: null,
    })

    // Computed
    const movimentacoesFiltradas = computed(() => estoqueStore.movimentacoes)
    const produtos = computed(() => produtoStore.produtos)
    const categorias = computed(() => categoriaStore.categorias)

    // Tipos de movimentação
    const tiposMovimentacao = [
      { value: 'ENTRADA', label: 'Entrada', color: 'text-green-600' },
      { value: 'SAIDA', label: 'Saída', color: 'text-red-600' },
      { value: 'AJUSTE', label: 'Ajuste', color: 'text-yellow-600' },
    ]

    // Métodos de formatação
    const formatarData = (data) => {
      return new Date(data).toLocaleDateString('pt-BR')
    }

    const formatarHora = (data) => {
      return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const formatarDataCompleta = (data) => {
      return `${formatarData(data)} ${formatarHora(data)}`
    }

    const formatarId = (id) => {
      return id.substring(0, 8)
    }

    const getCorTipo = (tipo) => {
      const tipoObj = tiposMovimentacao.find((t) => t.value === tipo)
      return tipoObj ? tipoObj.color : 'text-gray-600'
    }

    const getLabelTipo = (tipo) => {
      const tipoObj = tiposMovimentacao.find((t) => t.value === tipo)
      return tipoObj ? tipoObj.label : tipo
    }

    const getIconeTipo = (tipo) => {
      switch (tipo) {
        case 'ENTRADA':
          return 'fa-arrow-up'
        case 'SAIDA':
          return 'fa-arrow-down'
        case 'AJUSTE':
          return 'fa-wrench'
        default:
          return 'fa-circle'
      }
    }

    // Métodos de filtro
    const aplicarFiltros = () => {
      estoqueStore.aplicarFiltrosMovimentacoes(filtroLocal.value)
    }

    const limparFiltros = () => {
      filtroLocal.value = {
        produtoId: null,
        categoriaId: null,
        tipoMovimentacao: null,
        dataInicio: null,
        dataFim: null,
      }
      estoqueStore.limparFiltrosMovimentacoes()
    }

    // Métodos de paginação
    const mudarPagina = (pagina) => {
      estoqueStore.mudarPaginaMovimentacoes(pagina)
    }

    const mudarItensPorPagina = (event) => {
      estoqueStore.mudarItensPorPaginaMovimentacoes(parseInt(event.target.value))
    }

    const ordenar = (coluna) => {
      estoqueStore.ordenarMovimentacoes(coluna)
    }

    // Modal
    const abrirModal = () => {
      mostrarModal.value = true
    }

    const fecharModal = () => {
      mostrarModal.value = false
    }

    const movimentacaoSalva = () => {
      estoqueStore.listarMovimentacoes()
    }

    // Paginação visual
    const paginasVisiveis = computed(() => {
      const paginas = []
      const total = estoqueStore.totalPaginasMovimentacoes
      const atual = estoqueStore.paginaAtualMovimentacoes

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          paginas.push(i)
        }
      } else {
        if (atual <= 4) {
          for (let i = 1; i <= 5; i++) paginas.push(i)
          paginas.push('...')
          paginas.push(total)
        } else if (atual >= total - 3) {
          paginas.push(1)
          paginas.push('...')
          for (let i = total - 4; i <= total; i++) paginas.push(i)
        } else {
          paginas.push(1)
          paginas.push('...')
          for (let i = atual - 1; i <= atual + 1; i++) paginas.push(i)
          paginas.push('...')
          paginas.push(total)
        }
      }

      return paginas
    })

    // Lifecycle
    onMounted(async () => {
      await estoqueStore.listarMovimentacoes()
      await produtoStore.listarProdutos()
      await categoriaStore.listarCategorias()
    })

    return {
      // Store
      estoqueStore,

      // Estado
      mostrarModal,

      // Dados
      movimentacoesFiltradas,
      produtos,
      categorias,
      tiposMovimentacao,
      filtroLocal,
      paginasVisiveis,

      // Métodos
      formatarData,
      formatarHora,
      formatarDataCompleta,
      formatarId,
      getCorTipo,
      getLabelTipo,
      getIconeTipo,
      aplicarFiltros,
      limparFiltros,
      mudarPagina,
      mudarItensPorPagina,
      ordenar,
      abrirModal,
      fecharModal,
      movimentacaoSalva,
    }
  },
}
