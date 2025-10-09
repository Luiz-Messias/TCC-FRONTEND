import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProdutoStore } from '@/stores/produtoStore'
import ProdutoModal from '@/components/Produto/ProdutoModal.vue'

export default {
  name: 'ProdutoView',
  components: {
    ProdutoModal,
  },
  setup() {
    const produtoStore = useProdutoStore()
    const produtoParaExcluir = ref(null)

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
      if (produtoParaExcluir.value) {
        try {
          await excluirProduto(produtoParaExcluir.value.produtoId)
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
      // Só executa se não houver modal aberto e a tecla for Tab
      if (event.key === 'Tab' && !modalAberto.value) {
        event.preventDefault()
        abrirModal()
      }
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
    }
  },
}
