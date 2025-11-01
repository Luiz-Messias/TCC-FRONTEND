import { storeToRefs } from 'pinia'
import { useProdutoStore } from '@/stores/produtoStore'
import { useCodigoTributarioStore } from '@/stores/codigoTributarioStore'
import { onMounted, ref, watch, nextTick, computed } from 'vue'

export default {
  name: 'ProdutoModal',
  setup() {
    const produtoStore = useProdutoStore()
    const codigoTributarioStore = useCodigoTributarioStore()
    const nomeInput = ref(null)

    const { produto, categorias, marcas, modalAberto, modoEdicao, loading } =
      storeToRefs(produtoStore)

    const { codigosCST, codigosCSOSN } = storeToRefs(codigoTributarioStore)

    const { fecharModal, criarProduto, atualizarProduto, carregarCategorias, carregarMarcas } =
      produtoStore

    const { fetchAtivosByTipo } = codigoTributarioStore

    const salvarProduto = async () => {
      if (modoEdicao.value) {
        await atualizarProduto(produto.value.produtoId, produto.value)
      } else {
        await criarProduto(produto.value)
      }
    }

    const getCodigoSelecionadoInfo = () => {
      const todosCodigos = [...codigosCST.value, ...codigosCSOSN.value]
      const codigoSelecionado = todosCodigos.find((c) => c.id === produto.value.codigoTributarioId)
      if (codigoSelecionado) {
        return codigoSelecionado.observacoes || codigoSelecionado.descricao
      }
      return ''
    }

    // Foco automático quando o modal abrir
    watch(modalAberto, async (novoValor) => {
      if (novoValor) {
        await nextTick()
        nomeInput.value?.focus()
      }
    })

    onMounted(async () => {
      await Promise.all([
        carregarCategorias(),
        carregarMarcas(),
        fetchAtivosByTipo('CST'),
        fetchAtivosByTipo('CSOSN'),
      ])
    })

    return {
      produto,
      categorias,
      marcas,
      codigosCST,
      codigosCSOSN,
      modalAberto,
      modoEdicao,
      loading,
      nomeInput,
      fecharModal,
      salvarProduto,
      getCodigoSelecionadoInfo,
    }
  },
}
