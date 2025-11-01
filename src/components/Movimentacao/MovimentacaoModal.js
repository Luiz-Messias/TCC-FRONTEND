import { ref, computed, onMounted } from 'vue'
import { useEstoqueStore } from '@/stores/estoqueStore'
import { useProdutoStore } from '@/stores/produtoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { toast } from 'vue3-toastify'

export default {
  name: 'MovimentacaoModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    produtoSelecionado: {
      type: Object,
      default: null,
    },
  },
  emits: ['close', 'salvo'],
  setup(props, { emit }) {
    const estoqueStore = useEstoqueStore()
    const produtoStore = useProdutoStore()
    const categoriaStore = useCategoriaStore()

    // Form data
    const form = ref({
      produtoId: null,
      tipoMovimentacao: 'ENTRADA',
      quantidade: null,
      lote: '',
      dataFabricacao: '',
      dataValidade: '',
      observacoes: '',
    })

    const erros = ref({})
    const salvando = ref(false)

    // Computed
    const produtos = computed(() => produtoStore.produtos)
    const categorias = computed(() => categoriaStore.categorias)

    const produtoSelecionadoInfo = computed(() => {
      if (!form.value.produtoId) {
        return {
          saldoAtual: 0,
          estoqueMinimo: 0,
          estoqueMaximo: 0,
          lotes: [],
        }
      }
      const saldo = estoqueStore.saldos.find((s) => s.produtoId === form.value.produtoId)
      return saldo || {
        saldoAtual: 0,
        estoqueMinimo: 0,
        estoqueMaximo: 0,
        lotes: [],
      }
    })

    const tiposMovimentacao = [
      { value: 'ENTRADA', label: 'Entrada', icon: 'fa-arrow-up', color: 'text-green-600' },
      { value: 'SAIDA', label: 'Saída', icon: 'fa-arrow-down', color: 'text-red-600' },
      { value: 'AJUSTE', label: 'Ajuste', icon: 'fa-wrench', color: 'text-yellow-600' },
    ]

    const requererLote = computed(() => {
      return form.value.tipoMovimentacao === 'ENTRADA'
    })

    // Métodos
    const validarFormulario = () => {
      erros.value = {}

      if (!form.value.produtoId) {
        erros.value.produtoId = 'Selecione um produto'
      }

      if (!form.value.quantidade || form.value.quantidade <= 0) {
        erros.value.quantidade = 'Quantidade deve ser maior que zero'
      }

      if (form.value.tipoMovimentacao === 'SAIDA' || form.value.tipoMovimentacao === 'AJUSTE') {
        const saldo = estoqueStore.saldos.find((s) => s.produtoId === form.value.produtoId)
        if (saldo && form.value.quantidade > saldo.saldoAtual) {
          erros.value.quantidade = `Quantidade maior que o saldo disponível (${saldo.saldoAtual})`
        }
      }

      if (requererLote.value) {
        if (!form.value.numeroLote) {
          erros.value.numeroLote = 'Lote é obrigatório para entradas'
        }
        if (!form.value.dataFabricacao) {
          erros.value.dataFabricacao = 'Data de fabricação é obrigatória'
        }
        if (!form.value.dataValidade) {
          erros.value.dataValidade = 'Data de validade é obrigatória'
        }
        if (form.value.dataFabricacao && form.value.dataValidade) {
          if (new Date(form.value.dataValidade) <= new Date(form.value.dataFabricacao)) {
            erros.value.dataValidade = 'Data de validade deve ser posterior à fabricação'
          }
        }
      }

      // ✅ VALIDAÇÃO: Observações obrigatórias para AJUSTE
      if (form.value.tipoMovimentacao === 'AJUSTE') {
        if (!form.value.observacoes || form.value.observacoes.trim() === '') {
          erros.value.observacoes = 'Observações são obrigatórias para ajustes de estoque'
        }
      }

      return Object.keys(erros.value).length === 0
    }

    const salvar = async () => {
      if (!validarFormulario()) return

      salvando.value = true
      try {
        // Buscar o produto - primeiro tenta do estoque, depois do produto store
        let saldo = estoqueStore.saldos.find((s) => s.produtoId === form.value.produtoId)
        let produto = null

        if (!saldo) {
          // Se não encontrou no estoque, buscar do produto store
          produto = produtoStore.produtos.find((p) => p.id === form.value.produtoId)

          if (!produto) {
            toast.error('Produto não encontrado')
            salvando.value = false
            return
          }
        }

        const dados = {
          produtoId: form.value.produtoId,
          produtoNome: saldo?.produtoNome || produto?.nome || '',
          categoriaId: saldo?.categoriaId || produto?.categoriaId || null,
          categoriaNome: saldo?.categoriaNome || produto?.categoriaNome || '',
          tipoMovimentacao: form.value.tipoMovimentacao,
          quantidade: parseInt(form.value.quantidade),
          numeroLote: form.value.numeroLote || null,
          dataFabricacao: form.value.dataFabricacao || null,
          dataValidade: form.value.dataValidade || null,
          observacoes: form.value.observacoes || null,
          pedidoId: null,
        }

        await estoqueStore.registrarMovimentacao(dados)

        emit('salvo')
        fechar()
      } catch (error) {
        console.error('Erro ao salvar movimentação:', error)
      } finally {
        salvando.value = false
      }
    }

    const fechar = () => {
      limparFormulario()
      emit('close')
    }

    const limparFormulario = () => {
      form.value = {
        produtoId: null,
        tipoMovimentacao: 'ENTRADA',
        quantidade: null,
        numeroLote: '',
        dataFabricacao: '',
        dataValidade: '',
        observacoes: '',
      }
      erros.value = {}
    }

    const selecionarLote = (lote) => {
      form.value.numeroLote = lote.numeroLote
      form.value.dataFabricacao = lote.dataFabricacao
      form.value.dataValidade = lote.dataValidade
    }

    // Lifecycle
    onMounted(async () => {
      await produtoStore.listarProdutos()
      await categoriaStore.listarCategorias()

      if (props.produtoSelecionado) {
        form.value.produtoId = props.produtoSelecionado.produtoId
      }
    })

    return {
      form,
      erros,
      salvando,
      produtos,
      categorias,
      produtoSelecionadoInfo,
      tiposMovimentacao,
      requererLote,
      salvar,
      fechar,
      selecionarLote,
    }
  },
}
