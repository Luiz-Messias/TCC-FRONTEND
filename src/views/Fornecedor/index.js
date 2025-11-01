import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useFornecedorStore } from '@/stores/fornecedorStore'
import FornecedorModal from '@/components/Fornecedor/FornecedorModal.vue'

export default {
  name: 'FornecedorView',
  components: { FornecedorModal },
  setup() {
    const fornecedorStore = useFornecedorStore()
    const fornecedorParaExcluir = ref(null)

    const {
      fornecedores,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroAtivos,
      ordenacao,
    } = storeToRefs(fornecedorStore)

    const {
      listarFornecedores,
      abrirModal,
      excluirFornecedor,
      ativarFornecedor,
      inativarFornecedor,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      formatarCnpj,
      formatarTelefone,
    } = fornecedorStore

    const editarFornecedor = (fornecedor) => {
      abrirModal(fornecedor)
    }

    const confirmarExclusao = (fornecedor) => {
      fornecedorParaExcluir.value = fornecedor
    }

    const excluirConfirmado = async () => {
      if (fornecedorParaExcluir.value) {
        await excluirFornecedor(fornecedorParaExcluir.value.id)
        fornecedorParaExcluir.value = null
      }
    }

    onMounted(() => {
      listarFornecedores()
    })

    return {
      fornecedores,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroAtivos,
      ordenacao,
      fornecedorParaExcluir,
      listarFornecedores,
      abrirModal,
      editarFornecedor,
      confirmarExclusao,
      excluirConfirmado,
      ativarFornecedor,
      inativarFornecedor,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      formatarCnpj,
      formatarTelefone,
    }
  },
}
