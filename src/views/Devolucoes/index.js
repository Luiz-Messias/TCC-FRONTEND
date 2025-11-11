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
      processarDevolucao: processarDevolucaoStore,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      converterStatus,
      obterCorStatus,
      obterIconeStatus,
    } = devolucaoStore

    const editarDevolucao = (devolucao) => {
      abrirModal(devolucao)
    }

    const confirmarExclusao = async (devolucao) => {
      const result = await Swal.fire({
        title: 'Confirmar exclusão',
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
        title: 'Aprovar devolução',
        html: `
          <p>Confirma a aprovação desta devolução?</p>
          <textarea id="observacao" class="w-full mt-2 p-2 border rounded" 
                    placeholder="Observação (opcional)" rows="3"></textarea>
        `,
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
        preConfirm: () => {
          const observacao = document.getElementById('observacao').value
          return observacao || null
        },
      })

      if (result.isConfirmed) {
        await aprovarDevolucaoStore(id, result.value)
      }
    }

    const recusarDevolucao = async (id) => {
      const result = await Swal.fire({
        title: 'Recusar devolução',
        html: `
          <p>Informe o motivo da recusa:</p>
          <textarea id="motivo" class="w-full mt-2 p-2 border rounded" 
                    placeholder="Motivo da recusa (obrigatório)" rows="3" required></textarea>
        `,
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
        preConfirm: () => {
          const motivo = document.getElementById('motivo').value
          if (!motivo || motivo.trim() === '') {
            Swal.showValidationMessage('O motivo é obrigatório')
            return false
          }
          return motivo
        },
      })

      if (result.isConfirmed && result.value) {
        await recusarDevolucaoStore(id, result.value)
      }
    }

    const processarDevolucao = async (id) => {
      const result = await Swal.fire({
        title: 'Processar devolução',
        html: `
          <p>Confirma o processamento desta devolução? O produto será devolvido ao estoque.</p>
          <textarea id="observacao" class="w-full mt-2 p-2 border rounded" 
                    placeholder="Observação (opcional)" rows="3"></textarea>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, processar',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-4 py-2 rounded-lg',
          cancelButton: 'px-4 py-2 rounded-lg',
        },
        preConfirm: () => {
          const observacao = document.getElementById('observacao').value
          return observacao || null
        },
      })

      if (result.isConfirmed) {
        await processarDevolucaoStore(id, result.value)
      }
    }

    // Funções de formatação
    const formatarData = (data) => {
      if (!data) return '-'
      try {
        const date = new Date(data)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('pt-BR')
      } catch (e) {
        return '-'
      }
    }

    const formatarValor = (valor) => {
      if (!valor && valor !== 0) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor)
    }

    const formatarMotivo = (motivo) => {
      if (!motivo) return 'Não informado'
      // Converte PRODUTO_ERRADO para Produto errado
      return motivo
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letra) => letra.toUpperCase())
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
      processarDevolucao,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      converterStatus,
      obterCorStatus,
      obterIconeStatus,
      formatarData,
      formatarValor,
      formatarMotivo,
    }
  },
}
