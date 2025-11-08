import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDevolucaoStore } from '@/stores/devolucaoStore'
import { usePedidoStore } from '@/stores/pedidoStore'
import Swal from 'sweetalert2'

export default {
  name: 'DevolucaoModal',
  setup() {
    const devolucaoStore = useDevolucaoStore()
    const pedidoStore = usePedidoStore()

    const { modalAberto, modoEdicao, devolucao, loading, pedidos } = storeToRefs(devolucaoStore)
    const {
      fecharModal,
      criarDevolucao,
      atualizarDevolucao,
      carregarPedidosConcluidos,
      obterCorStatus,
      obterIconeStatus,
    } = devolucaoStore

    const formulario = ref({
      id: null,
      pedidoId: null,
      clienteNome: '',
      dataDevolucao: new Date().toISOString().split('T')[0],
      motivo: '',
      observacoes: '',
      status: 'PENDENTE',
      itens: [],
      valorTotal: 0,
    })

    const dataHoje = new Date().toISOString().split('T')[0]

    // Computed para calcular valor total da devolução
    const valorTotalDevolucao = computed(() => {
      return formulario.value.itens
        .filter((item) => item.selecionado)
        .reduce((total, item) => {
          return total + (item.quantidadeDevolver || 0) * (item.precoUnitario || 0)
        }, 0)
    })

    // Carrega pedidos concluídos ao abrir o modal
    watch(modalAberto, async (novoValor) => {
      if (novoValor) {
        await carregarPedidosConcluidos()
        console.log('Modal aberto - Pedidos disponíveis:', pedidos.value.length)

        if (modoEdicao.value && devolucao.value) {
          // Modo edição - carrega dados da devolução
          formulario.value = {
            id: devolucao.value.id,
            pedidoId: devolucao.value.pedidoId,
            clienteNome: devolucao.value.clienteNome || '',
            dataDevolucao: devolucao.value.dataDevolucao
              ? new Date(devolucao.value.dataDevolucao).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            motivo: devolucao.value.motivo || '',
            observacoes: devolucao.value.observacoes || '',
            status: devolucao.value.status || 'PENDENTE',
            itens:
              devolucao.value.itens?.map((item) => ({
                ...item,
                selecionado: true,
                quantidadeDevolver: item.quantidadeDevolver || item.quantidade,
              })) || [],
            valorTotal: devolucao.value.valorTotal || 0,
          }
        } else {
          // Modo criação - limpa o formulário
          formulario.value = {
            id: null,
            pedidoId: null,
            clienteNome: '',
            dataDevolucao: new Date().toISOString().split('T')[0],
            motivo: '',
            observacoes: '',
            status: 'PENDENTE',
            itens: [],
            valorTotal: 0,
          }
        }
      }
    })

    // Carrega dados do pedido selecionado
    const carregarPedido = async () => {
      if (!formulario.value.pedidoId) {
        formulario.value.clienteNome = ''
        formulario.value.itens = []
        return
      }

      try {
        const pedido = await pedidoStore.obterPedido(formulario.value.pedidoId)

        formulario.value.clienteNome = pedido.clienteNome || pedido.cliente?.nome || ''

        // Mapeia os itens do pedido
        formulario.value.itens = (pedido.itens || []).map((item) => ({
          id: item.id,
          produtoId: item.produtoId,
          produtoNome: item.produtoNome || item.produto?.nome || 'Produto não encontrado',
          produtoCodigo: item.produtoCodigo || item.produto?.codigo || '',
          unidade: item.unidade || item.produto?.unidade || 'UN',
          quantidade: item.quantidade || 0,
          quantidadeDevolver: 0,
          precoUnitario: item.precoUnitario || item.preco || 0,
          selecionado: false,
        }))
      } catch (erro) {
        console.error('Erro ao carregar pedido:', erro)
        formulario.value.clienteNome = ''
        formulario.value.itens = []
      }
    }

    // Salva a devolução
    const salvar = async () => {
      // Valida se há itens selecionados
      const itensSelecionados = formulario.value.itens.filter((item) => item.selecionado)

      if (itensSelecionados.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Selecione pelo menos um item para devolução.',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-4 py-2 rounded-lg',
          },
        })
        return
      }

      // Valida quantidades
      const quantidadesInvalidas = itensSelecionados.some(
        (item) =>
          !item.quantidadeDevolver ||
          item.quantidadeDevolver <= 0 ||
          item.quantidadeDevolver > item.quantidade,
      )

      if (quantidadesInvalidas) {
        Swal.fire({
          icon: 'error',
          title: 'Quantidades Inválidas',
          text: 'Verifique as quantidades informadas. Todos os itens selecionados devem ter quantidade válida.',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-4 py-2 rounded-lg',
          },
        })
        return
      }

      const dadosDevolucao = {
        pedidoId: formulario.value.pedidoId,
        dataDevolucao: formulario.value.dataDevolucao,
        motivo: formulario.value.motivo,
        observacoes: formulario.value.observacoes,
        itens: itensSelecionados.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidadeDevolver,
          precoUnitario: item.precoUnitario,
        })),
        valorTotal: valorTotalDevolucao.value,
      }

      try {
        if (modoEdicao.value && formulario.value.id) {
          await atualizarDevolucao(formulario.value.id, dadosDevolucao)
        } else {
          await criarDevolucao(dadosDevolucao)
        }
      } catch (erro) {
        console.error('Erro ao salvar devolução:', erro)
      }
    }

    return {
      modalAberto,
      modoEdicao,
      loading,
      pedidos,
      formulario,
      dataHoje,
      valorTotalDevolucao,
      carregarPedido,
      salvar,
      fecharModal,
      obterCorStatus,
      obterIconeStatus,
    }
  },
}
