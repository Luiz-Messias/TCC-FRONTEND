import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePedidoStore } from '@/stores/pedidoStore'
import { useProdutoStore } from '@/stores/produtoStore'
import SeletorProduto from '@/components/SeletorProduto/SeletorProduto.vue'
import { toast } from 'vue3-toastify' // ✅ ADICIONADO: Importar toast

export default {
  name: 'PedidoView',
  components: {
    SeletorProduto,
  },
  setup() {
    const pedidoStore = usePedidoStore()
    const produtoStore = useProdutoStore()

    const { clientes } = storeToRefs(pedidoStore)
    const { produtos } = storeToRefs(produtoStore)

    const { carregarClientes, criarPedido } = pedidoStore
    const { listarProdutos: carregarProdutos } = produtoStore

    const produtosSelecionados = ref([])

    // Formulário
    const cliente = ref('')
    const data = ref(new Date().toISOString().split('T')[0])
    const observacoes = ref('')

    // Computed para calcular o total do pedido
    const totalPedido = computed(() => {
      return produtosSelecionados.value.reduce((total, item) => {
        return total + item.preco * (item.quantidade || 1)
      }, 0)
    })

    // Métodos
    const atualizarItensSelecionados = (itensSelecionados) => {
      produtosSelecionados.value = itensSelecionados.map((item) => ({
        ...item,
        quantidade: item.quantidade || 1,
      }))
    }

    const removerProdutoSelecionado = (index) => {
      produtosSelecionados.value.splice(index, 1)
    }

    const limparFormulario = () => {
      cliente.value = ''
      data.value = new Date().toISOString().split('T')[0]
      observacoes.value = ''
      produtosSelecionados.value = []
    }

    const salvarPedido = async () => {
      try {
        if (!cliente.value) {
          toast.error('Selecione um cliente') // ✅ CORRIGIDO: Usar toast
          return
        }

        if (produtosSelecionados.value.length === 0) {
          toast.error('Adicione pelo menos um produto') // ✅ CORRIGIDO: Usar toast
          return
        }

        // ✅ CORRIGIDO: Melhor formatação de data
        const dataPedidoISO = new Date(data.value).toISOString()

        const dadosPedido = {
          clienteId: cliente.value,
          dataPedido: dataPedidoISO,
          observacoes: observacoes.value || '',
          itens: produtosSelecionados.value.map((item) => ({
            produtoId: item.id,
            quantidade: item.quantidade || 1,
            precoUnitario: item.preco,
          })),
        }

        await criarPedido(dadosPedido)
        limparFormulario()
      } catch (erro) {
        console.error('Erro ao salvar pedido:', erro)
        toast.error('Erro ao salvar pedido') // ✅ ADICIONADO: Feedback de erro
      }
    }

    // Filtro para moeda
    const currency = (valor) => {
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    // Carregar dados iniciais
    onMounted(async () => {
      await Promise.all([carregarClientes(), carregarProdutos()])
    })

    return {
      clientes,
      produtos,
      cliente,
      data,
      observacoes,
      totalPedido,
      produtosSelecionados,
      atualizarItensSelecionados,
      removerProdutoSelecionado,
      limparFormulario,
      salvarPedido,
      currency,
    }
  },
}
