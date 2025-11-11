import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDevolucaoStore } from '@/stores/devolucaoStore'
import { usePedidoStore } from '@/stores/pedidoStore'
import api from '@/api/axiosConfig'
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

    // Computed para verificar se pode editar (apenas PENDENTE pode ser editado)
    const podeEditar = computed(() => {
      return !modoEdicao.value || formulario.value.status === 'PENDENTE'
    })

    // Computed para calcular valor total da devolução
    const valorTotalDevolucao = computed(() => {
      const total = formulario.value.itens
        .filter((item) => item.selecionado)
        .reduce((soma, item) => {
          const qtd = parseFloat(item.quantidadeDevolver) || 0
          const preco = parseFloat(item.precoUnitario) || 0
          return soma + qtd * preco
        }, 0)

      console.log('Valor total calculado:', total)
      return total
    })

    // Watch para auto-preencher quantidade quando selecionar um item
    watch(
      () => formulario.value.itens,
      (novosItens) => {
        novosItens.forEach((item) => {
          if (item.selecionado && (!item.quantidadeDevolver || item.quantidadeDevolver === 0)) {
            item.quantidadeDevolver = item.quantidade
          }
        })
      },
      { deep: true },
    )

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

        console.log('✅ Pedido carregado:', pedido)

        // Busca o nome do cliente se não vier no pedido
        if (pedido.clienteId && !pedido.clienteNome) {
          try {
            const clienteResponse = await api.get(`/cliente/${pedido.clienteId}`)
            formulario.value.clienteNome =
              clienteResponse.data.data?.nome ||
              clienteResponse.data.nome ||
              'Cliente não encontrado'
          } catch {
            formulario.value.clienteNome = 'Cliente não encontrado'
          }
        } else {
          formulario.value.clienteNome = pedido.clienteNome || pedido.cliente?.nome || ''
        }

        // Busca todos os produtos para mapear os nomes
        const produtosResponse = await api.get('/produto', { params: { itensPorPagina: 1000 } })
        const produtos =
          produtosResponse.data.data?.items ||
          produtosResponse.data.items ||
          produtosResponse.data ||
          []

        // Cria mapa de produtos
        const produtosMap = {}
        produtos.forEach((produto) => {
          produtosMap[produto.id] = produto
        })

        // Mapeia os itens do pedido
        formulario.value.itens = (pedido.itens || []).map((item) => {
          const produto = produtosMap[item.produtoId]

          // Garante que o preço seja um número válido
          let preco = parseFloat(item.precoUnitario) || 0

          const itemMapeado = {
            id: item.itemPedidoId || item.id,
            produtoId: item.produtoId,
            produtoNome: produto?.nome || item.produtoNome || 'Produto não encontrado',
            produtoCodigo: produto?.codigo || item.produtoCodigo || '',
            unidade: produto?.unidade || item.unidade || 'UN',
            quantidade: parseFloat(item.quantidade) || 0,
            quantidadeDevolver: 0,
            precoUnitario: preco,
            selecionado: false,
          }

          return itemMapeado
        })

        console.log('✅ Total de itens carregados:', formulario.value.itens.length)
      } catch (erro) {
        console.error('Erro ao carregar pedido:', erro)
        Swal.fire({
          icon: 'error',
          title: 'Erro ao Carregar Pedido',
          text: 'Não foi possível carregar os dados do pedido. Tente novamente.',
          confirmButtonColor: '#3b82f6',
        })
        formulario.value.clienteNome = ''
        formulario.value.itens = []
      }
    }

    // Salva a devolução
    const salvar = async () => {
      // Regra: Apenas PENDENTE pode ser atualizado (PUT)
      if (modoEdicao.value && formulario.value.status !== 'PENDENTE') {
        Swal.fire({
          icon: 'error',
          title: 'Operação Não Permitida',
          text: `Devoluções com status ${formulario.value.status} não podem ser editadas.`,
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-4 py-2 rounded-lg',
          },
        })
        return
      }

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
      const quantidadesInvalidas = itensSelecionados.some((item) => {
        const qtdDevolver = parseFloat(item.quantidadeDevolver)
        const qtdTotal = parseFloat(item.quantidade)
        return isNaN(qtdDevolver) || qtdDevolver <= 0 || qtdDevolver > qtdTotal
      })

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

      try {
        // API aceita UMA devolução por vez (um produto)
        // Criar múltiplas devoluções se houver múltiplos itens selecionados
        const promises = itensSelecionados.map((item) => {
          const dadosDevolucao = {
            pedidoId: formulario.value.pedidoId,
            produtoId: item.produtoId,
            clienteId: null, // Será preenchido automaticamente pela API
            quantidade: parseFloat(item.quantidadeDevolver),
            motivo: formulario.value.motivo,
          }

          if (modoEdicao.value && item.id) {
            // Atualização - apenas se PENDENTE
            return atualizarDevolucao(item.id, {
              ...dadosDevolucao,
              id: item.id,
            })
          } else {
            // Criação
            return criarDevolucao(dadosDevolucao)
          }
        })

        await Promise.all(promises)
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
      podeEditar,
      valorTotalDevolucao,
      carregarPedido,
      salvar,
      fecharModal,
      obterCorStatus,
      obterIconeStatus,
    }
  },
}
