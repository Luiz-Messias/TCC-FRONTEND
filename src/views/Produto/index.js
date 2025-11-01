import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProdutoStore } from '@/stores/produtoStore'
import ProdutoModal from '@/components/Produto/ProdutoModal.vue'
import CategoriaModal from '@/components/Categoria/CategoriaGerenciarModal.vue'
import MarcaModal from '@/components/Marca/MarcaGerenciarModal.vue'

export default {
  name: 'ProdutoView',
  components: {
    ProdutoModal,
    CategoriaModal,
    MarcaModal,
  },
  setup() {
    const produtoStore = useProdutoStore()
    const produtoParaExcluir = ref(null)
    const modalCategoriaAberto = ref(false)
    const modalMarcaAberto = ref(false)

    const {
      produtos,
      categorias,
      marcas,
      loading,
      modalAberto,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroCategoria,
      filtroMarca,
      ordenacao,
    } = storeToRefs(produtoStore)

    const {
      listarProdutos,
      abrirModal,
      excluirProduto,
      carregarCategorias,
      carregarMarcas,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
    } = produtoStore

    const editarProduto = (produto) => {
      abrirModal(produto)
    }

    const confirmarExclusao = (produto) => {
      produtoParaExcluir.value = produto
    }

    const excluirProdutoConfirmado = async () => {
      debugger
      if (produtoParaExcluir.value) {
        try {
          await excluirProduto(produtoParaExcluir.value.id)
        } finally {
          produtoParaExcluir.value = null
        }
      }
    }

    const obterNomeCategoria = (categoriaId) => {
      const categoria = categorias.value.find((c) => c.id === categoriaId)
      return categoria ? categoria.nome : '-'
    }

    const obterNomeMarca = (marcaId) => {
      const marca = marcas.value.find((m) => m.id === marcaId)
      return marca ? marca.nome : '-'
    }

    const formatarMoeda = (valor) => {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(valor || 0)
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

    // Função para lidar com atalhos de teclado
    const lidarComTeclado = (event) => {
      // Tab - Novo produto
      if (
        event.key === 'Tab' &&
        !modalAberto.value &&
        !modalCategoriaAberto.value &&
        !modalMarcaAberto.value
      ) {
        event.preventDefault()
        abrirModal()
      }

      // Alt+C - Gerenciar categorias
      if (event.altKey && event.key.toLowerCase() === 'c' && !modalAberto.value) {
        event.preventDefault()
        abrirModalCategoria()
      }

      // Alt+M - Gerenciar marcas
      if (event.altKey && event.key.toLowerCase() === 'm' && !modalAberto.value) {
        event.preventDefault()
        abrirModalMarca()
      }

      // ESC - Fechar modais
      if (event.key === 'Escape') {
        if (modalCategoriaAberto.value) {
          fecharModalCategoria()
        } else if (modalMarcaAberto.value) {
          fecharModalMarca()
        }
      }
    }

    const abrirModalCategoria = () => {
      modalCategoriaAberto.value = true
    }

    const fecharModalCategoria = () => {
      modalCategoriaAberto.value = false
    }

    const recarregarCategorias = async () => {
      await carregarCategorias()
    }

    const abrirModalMarca = () => {
      modalMarcaAberto.value = true
    }

    const fecharModalMarca = () => {
      modalMarcaAberto.value = false
    }

    const recarregarMarcas = async () => {
      await carregarMarcas()
    }

    onMounted(async () => {
      await Promise.all([listarProdutos(), carregarCategorias(), carregarMarcas()])

      // Adicionar listener para atalhos de teclado
      document.addEventListener('keydown', lidarComTeclado)
    })

    // Cleanup no unmount
    onUnmounted(() => {
      document.removeEventListener('keydown', lidarComTeclado)
    })

    return {
      // Estado
      produtos,
      categorias,
      marcas,
      loading,
      modalAberto,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroCategoria,
      filtroMarca,
      ordenacao,
      produtoParaExcluir,
      modalCategoriaAberto,
      modalMarcaAberto,

      // Métodos
      listarProdutos,
      abrirModal,
      editarProduto,
      confirmarExclusao,
      excluirProdutoConfirmado,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      obterNomeCategoria,
      obterNomeMarca,
      formatarMoeda,
      gerarPaginas,
      abrirModalCategoria,
      fecharModalCategoria,
      recarregarCategorias,
      abrirModalMarca,
      fecharModalMarca,
      recarregarMarcas,
    }
  },
}
