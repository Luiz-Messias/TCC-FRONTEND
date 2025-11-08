import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useDevolucaoStore } from '@/stores/devolucaoStore'
import DevolucaoModal from '@/components/Devolucao/DevolucaoModal.vue'
import Swal from 'sweetalert2'

export default {
  name: 'DevolucoesView',
  components: {
    DevolucaoModal,
  },
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
      aprovarDevolucao: aprovarDevolucaoStore,
      recusarDevolucao: recusarDevolucaoStore,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      obterCorStatus,
      obterIconeStatus,
    } = devolucaoStore

    const editarDevolucao = (devolucao) => {
      abrirModal(devolucao)
    }

    const confirmarExclusao = async (devolucao) => {
      const result = await Swal.fire({
        title: 'Confirmar Exclusão',
        html: `Tem certeza que deseja excluir a devolução <strong>#${devolucao.id}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 rounded-lg',
          cancelButton: 'px-4 py-2 rounded-lg',
        },
      })

      if (result.isConfirmed) {
        await excluirDevolucao(devolucao.id)
      }
    }

    const aprovarDevolucao = async (id) => {
      const result = await Swal.fire({
        title: 'Aprovar Devolução',
        text: 'Confirma a aprovação desta devolução? O estoque será atualizado.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, aprovar',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 rounded-lg',
          cancelButton: 'px-4 py-2 rounded-lg',
        },
      })

      if (result.isConfirmed) {
        await aprovarDevolucaoStore(id)
      }
    }

    const recusarDevolucao = async (id) => {
      const result = await Swal.fire({
        title: 'Recusar Devolução',
        text: 'Confirma a recusa desta devolução?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, recusar',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 rounded-lg',
          cancelButton: 'px-4 py-2 rounded-lg',
        },
      })

      if (result.isConfirmed) {
        await recusarDevolucaoStore(id)
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
      listarDevolucoes,
      abrirModal,
      editarDevolucao,
      confirmarExclusao,
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
