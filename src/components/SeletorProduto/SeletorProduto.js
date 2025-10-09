import { ref, watch, computed, onMounted } from 'vue'

export default {
  name: 'SeletorProduto',
  props: {
    produtos: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'selecionados'],
  setup(props, { emit }) {
    const busca = ref('')
    const produtosFiltrados = ref([])
    const produtosSelecionados = ref([...props.modelValue])

    const produtoSelecionadoIds = computed(() => produtosSelecionados.value.map((p) => p.id))

    const filtrarProdutos = () => {
      const termo = busca.value.trim().toLowerCase()
      if (!termo) {
        // Mostrar todos os produtos quando não há busca
        produtosFiltrados.value = props.produtos.slice(0, 10) // Limitar a 10 para performance
        return
      }
      produtosFiltrados.value = props.produtos.filter(
        (p) => p.nome.toLowerCase().includes(termo) || String(p.id).includes(termo),
      )
    }

    const selecionarProduto = (produto) => {
      if (!produtoSelecionadoIds.value.includes(produto.id)) {
        const produtoComQuantidade = {
          ...produto,
          quantidade: 1,
        }
        produtosSelecionados.value.push(produtoComQuantidade)
        emit('update:modelValue', produtosSelecionados.value)
        emit('selecionados', produtosSelecionados.value)
      }
    }

    const removerProduto = (produto) => {
      produtosSelecionados.value = produtosSelecionados.value.filter((p) => p.id !== produto.id)
      emit('update:modelValue', produtosSelecionados.value)
      emit('selecionados', produtosSelecionados.value)
    }

    // Carregar produtos iniciais quando o componente montar
    onMounted(() => {
      filtrarProdutos()
    })

    watch(
      () => props.modelValue,
      (novo) => {
        produtosSelecionados.value = [...novo]
      },
    )

    // Atualizar lista quando produtos mudarem
    watch(
      () => props.produtos,
      () => {
        filtrarProdutos()
      },
    )

    return {
      busca,
      produtosFiltrados,
      produtosSelecionados,
      produtoSelecionadoIds,
      filtrarProdutos,
      selecionarProduto,
      removerProduto,
    }
  },
}
