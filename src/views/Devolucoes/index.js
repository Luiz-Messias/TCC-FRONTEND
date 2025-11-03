import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useDevolucaoStore } from '@/stores/devolucaoStore'

export default {
  name: 'DevolucoesView',
  setup() {
    const devolucaoStore = useDevolucaoStore()
    const devolucaoParaExcluir = ref(null)

    const {
      devolucoes,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroStatus,
      ordenacao,
    } = storeToRefs(devolucaoStore)

    const {
      listarDevolucoes,
      abrirModal,
      excluirDevolucao,
      aprovarDevolucao,
      recusarDevolucao,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      obterCorStatus,
      obterIconeStatus,
    } = devolucaoStore

    const editarDevolucao = (devolucao) => {
      abrirModal(devolucao)
    }

    const confirmarExclusao = (devolucao) => {
      devolucaoParaExcluir.value = devolucao
    }

    const excluirConfirmado = async () => {
      if (devolucaoParaExcluir.value) {
        await excluirDevolucao(devolucaoParaExcluir.value.id)
        devolucaoParaExcluir.value = null
      }
    }

    onMounted(() => {
      listarDevolucoes()
    })

    return {
      devolucoes,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroStatus,
      ordenacao,
      devolucaoParaExcluir,
      listarDevolucoes,
      abrirModal,
      editarDevolucao,
      confirmarExclusao,
      excluirConfirmado,
      aprovarDevolucao,
      recusarDevolucao,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      obterCorStatus,
      obterIconeStatus,
    }
  },
}
