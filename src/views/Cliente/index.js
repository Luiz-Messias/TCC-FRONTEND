import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useClienteStore } from '@/stores/clienteStore'
import ClienteModal from '@/components/Cliente/ClienteModal.vue'

export default {
  name: 'ClienteView',
  components: { ClienteModal },
  setup() {
    const clienteStore = useClienteStore()
    const clienteParaExcluir = ref(null)

    const {
      clientes,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroAtivos,
      ordenacao,
    } = storeToRefs(clienteStore)

    const {
      listarClientes,
      abrirModal,
      excluirCliente,
      ativarCliente,
      inativarCliente,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      formatarCpfCnpj,
      formatarTelefone,
    } = clienteStore

    const editarCliente = (cliente) => {
      abrirModal(cliente)
    }

    const confirmarExclusao = (cliente) => {
      clienteParaExcluir.value = cliente
    }

    const excluirConfirmado = async () => {
      if (clienteParaExcluir.value) {
        await excluirCliente(clienteParaExcluir.value.id)
        clienteParaExcluir.value = null
      }
    }

    onMounted(() => {
      listarClientes()
    })

    return {
      clientes,
      loading,
      paginaAtual,
      itensPorPagina,
      totalItens,
      totalPaginas,
      termoBusca,
      filtroAtivos,
      ordenacao,
      clienteParaExcluir,
      listarClientes,
      abrirModal,
      editarCliente,
      confirmarExclusao,
      excluirConfirmado,
      ativarCliente,
      inativarCliente,
      aplicarFiltros,
      limparFiltros,
      alterarOrdenacao,
      formatarCpfCnpj,
      formatarTelefone,
    }
  },
}
