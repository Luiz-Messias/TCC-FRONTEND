import { storeToRefs } from 'pinia'
import { useProdutoStore } from '@/stores/produtoStore'
import { onMounted, ref, watch, nextTick } from 'vue'

export default {
  name: 'ProdutoModal',
  setup() {
    const produtoStore = useProdutoStore()
    const nomeInput = ref(null)

    const { produto, categorias, marcas, modalAberto, modoEdicao, loading } =
      storeToRefs(produtoStore)

    const { fecharModal, criarProduto, atualizarProduto, carregarCategorias, carregarMarcas } =
      produtoStore

    const salvarProduto = async () => {
      if (modoEdicao.value) {
        await atualizarProduto(produto.value.produtoId, produto.value)
      } else {
        await criarProduto(produto.value)
      }
    }

    // Foco automático quando o modal abrir
    watch(modalAberto, async (novoValor) => {
      if (novoValor) {
        await nextTick()
        nomeInput.value?.focus()
      }
    })

    onMounted(async () => {
      await Promise.all([carregarCategorias(), carregarMarcas()])
    })

    return {
      produto,
      categorias,
      marcas,
      modalAberto,
      modoEdicao,
      loading,
      nomeInput,
      fecharModal,
      salvarProduto,
    }
  },
}
