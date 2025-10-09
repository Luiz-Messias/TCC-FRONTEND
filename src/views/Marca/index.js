import { onMounted, ref, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarcaStore } from '@/stores/marcaStore'
import MarcaModal from '@/components/Marca/MarcaModal.vue'

export default {
  name: 'MarcaView',
  components: {
    MarcaModal,
  },
  setup() {
    const marcaStore = useMarcaStore()
    const marcaParaExcluir = ref(null)

    const {
      marcas,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      ordenacao,
      modalAberto,
    } = storeToRefs(marcaStore)

    const {
      listarMarcas,
      abrirModal,
      excluirMarca,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
    } = marcaStore

    const editarMarca = (marca) => {
      abrirModal(marca)
    }

    const confirmarExclusao = (marca) => {
      marcaParaExcluir.value = marca
    }

    const excluirMarcaConfirmado = async () => {
      if (marcaParaExcluir.value) {
        try {
          await excluirMarca(marcaParaExcluir.value.id)
        } finally {
          marcaParaExcluir.value = null
        }
      }
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

    // Atalho de teclado para criar nova marca
    const handleKeyPress = (event) => {
      // Só executa se não houver modal aberto e a tecla for Tab
      if (event.key === 'Tab' && !modalAberto.value) {
        event.preventDefault()
        abrirModal()
      }
    }

    onMounted(async () => {
      await listarMarcas()
      // Adiciona o listener global para a tecla Tab
      document.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      // Remove o listener quando o componente for desmontado
      document.removeEventListener('keydown', handleKeyPress)
    })

    return {
      // Estado
      marcas,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      ordenacao,
      marcaParaExcluir,

      // Métodos
      listarMarcas,
      abrirModal,
      editarMarca,
      confirmarExclusao,
      excluirMarcaConfirmado,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      gerarPaginas,
    }
  },
}
