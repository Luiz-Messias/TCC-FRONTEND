import { ref, onMounted } from 'vue'
import { useProdutoStore } from '@/stores/produtoStore'
import { usePedidoStore } from '@/stores/pedidoStore'
import { useClienteStore } from '@/stores/clienteStore'
import { useEstoqueStore } from '@/stores/estoqueStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import BaseChart from '@/components/BaseChart.vue'

export default {
  name: 'DashboardView',
  components: {
    BaseChart,
  },
  setup() {
    const produtoStore = useProdutoStore()
    const pedidoStore = usePedidoStore()
    const clienteStore = useClienteStore()
    const estoqueStore = useEstoqueStore()
    const categoriaStore = useCategoriaStore()

    const loadingEstatisticas = ref(true)
    const loadingGraficos = ref(true)

    const estatisticas = ref({
      totalPedidos: 0,
      totalProdutos: 0,
      totalClientes: 0,
      totalMovimentacoes: 0,
    })

    const graficosPedidosStatus = ref({
      labels: [],
      datasets: [],
    })

    const graficosTopProdutos = ref({
      labels: [],
      datasets: [],
    })

    const graficosMovimentacoes = ref({
      labels: [],
      datasets: [],
    })

    const graficosProdutosCategorias = ref({
      labels: [],
      datasets: [],
    })

    const optionsGraficoPizza = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    }

    const optionsGraficoBarra = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }

    const optionsGraficoLinha = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    }

    const carregarEstatisticas = async () => {
      try {
        await Promise.all([
          pedidoStore.listarPedidos(),
          produtoStore.listarProdutos(),
          clienteStore.listarClientes(),
          estoqueStore.listarMovimentacoes(),
        ])

        estatisticas.value = {
          totalPedidos: pedidoStore.pedidos.length,
          totalProdutos: produtoStore.produtos.length,
          totalClientes: clienteStore.clientes.length,
          totalMovimentacoes: estoqueStore.movimentacoes.length,
        }
      } catch (erro) {
        console.error('Erro ao carregar estatísticas:', erro)
      } finally {
        loadingEstatisticas.value = false
      }
    }

    const carregarGraficos = async () => {
      try {
        // Carregar dados necessários
        await Promise.all([
          pedidoStore.listarPedidos(),
          produtoStore.listarProdutos(),
          estoqueStore.listarMovimentacoes(),
          categoriaStore.listarCategorias(),
        ])

        console.log('Dados carregados:', {
          pedidos: pedidoStore.pedidos?.length || 0,
          produtos: produtoStore.produtos?.length || 0,
          movimentacoes: estoqueStore.movimentacoes?.length || 0,
          categorias: categoriaStore.categorias?.length || 0,
        })

        // Gráfico de Pedidos por Status
        const statusContagem = {}
        const statusNomes = {
          0: 'Pendente',
          1: 'Concluído',
          2: 'Cancelado',
          PENDENTE: 'Pendente',
          CONCLUIDO: 'Concluído',
          CANCELADO: 'Cancelado',
        }

        if (pedidoStore.pedidos && Array.isArray(pedidoStore.pedidos)) {
          pedidoStore.pedidos.forEach((pedido) => {
            const status = statusNomes[pedido.status] || 'Outro'
            statusContagem[status] = (statusContagem[status] || 0) + 1
          })
        }

        const labelsStatus = Object.keys(statusContagem)
        const dataStatus = Object.values(statusContagem)

        console.log('Gráfico Pedidos Status:', { labelsStatus, dataStatus })

        graficosPedidosStatus.value = {
          labels: labelsStatus.length > 0 ? labelsStatus : ['Sem Dados'],
          datasets: [
            {
              data: dataStatus.length > 0 ? dataStatus : [0],
              backgroundColor: [
                'rgba(59, 130, 246, 0.7)', // Azul - Pendente
                'rgba(34, 197, 94, 0.7)', // Verde - Concluído
                'rgba(239, 68, 68, 0.7)', // Vermelho - Cancelado
              ],
              borderColor: ['rgb(59, 130, 246)', 'rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
              borderWidth: 1,
            },
          ],
        }

        // Top 5 Produtos Mais Vendidos
        const vendasPorProduto = {}
        if (pedidoStore.pedidos && Array.isArray(pedidoStore.pedidos)) {
          pedidoStore.pedidos.forEach((pedido) => {
            if (pedido.status === 'CONCLUIDO' || pedido.status === 1) {
              if (pedido.itens && Array.isArray(pedido.itens)) {
                pedido.itens.forEach((item) => {
                  if (!vendasPorProduto[item.produtoId]) {
                    // Buscar nome do produto pelo produtoId na lista de produtos
                    const produto = produtoStore.produtos.find((p) => p.id === item.produtoId)
                    vendasPorProduto[item.produtoId] = {
                      nome: produto?.nome || item.produtoNome || `Produto #${item.produtoId}`,
                      quantidade: 0,
                    }
                  }
                  vendasPorProduto[item.produtoId].quantidade += item.quantidade || 0
                })
              }
            }
          })
        }

        const topProdutos = Object.values(vendasPorProduto)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5)

        console.log('Top Produtos:', topProdutos)

        graficosTopProdutos.value = {
          labels: topProdutos.length > 0 ? topProdutos.map((p) => p.nome) : ['Sem Dados'],
          datasets: [
            {
              label: 'Quantidade Vendida',
              data: topProdutos.length > 0 ? topProdutos.map((p) => p.quantidade) : [0],
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            },
          ],
        }

        // Gráfico de Movimentações (Últimos 7 dias)
        const hoje = new Date()
        const ultimos7Dias = []
        for (let i = 6; i >= 0; i--) {
          const data = new Date(hoje)
          data.setDate(data.getDate() - i)
          ultimos7Dias.push({
            data: data.toISOString().split('T')[0],
            label: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            entradas: 0,
            saidas: 0,
          })
        }

        console.log('Total de movimentações:', estoqueStore.movimentacoes?.length || 0)
        console.log('Exemplo de movimentação:', estoqueStore.movimentacoes?.[0])

        if (estoqueStore.movimentacoes && Array.isArray(estoqueStore.movimentacoes)) {
          estoqueStore.movimentacoes.forEach((mov) => {
            // Tentar diferentes formatos de data
            let dataStr = null
            if (mov.data) {
              // Se já vier como string ISO
              if (typeof mov.data === 'string') {
                dataStr = mov.data.split('T')[0]
              }
              // Se vier como objeto Date
              else if (mov.data instanceof Date) {
                dataStr = mov.data.toISOString().split('T')[0]
              }
            }
            // Tentar também mov.dataMovimentacao
            else if (mov.dataMovimentacao) {
              if (typeof mov.dataMovimentacao === 'string') {
                dataStr = mov.dataMovimentacao.split('T')[0]
              } else if (mov.dataMovimentacao instanceof Date) {
                dataStr = mov.dataMovimentacao.toISOString().split('T')[0]
              }
            }

            if (dataStr) {
              const diaEncontrado = ultimos7Dias.find((d) => d.data === dataStr)
              if (diaEncontrado) {
                // Verificar diferentes formatos de tipo (mov.tipo OU mov.tipoMovimentacao)
                const tipoRaw = mov.tipoMovimentacao || mov.tipo
                const tipoStr = typeof tipoRaw === 'string' ? tipoRaw.toUpperCase() : tipoRaw

                if (tipoStr === 'ENTRADA' || tipoStr === 0 || tipoStr === '0') {
                  diaEncontrado.entradas += mov.quantidade || 0
                  console.log('Entrada adicionada:', mov.quantidade, 'em', dataStr)
                } else if (tipoStr === 'SAIDA' || tipoStr === 1 || tipoStr === '1') {
                  diaEncontrado.saidas += mov.quantidade || 0
                  console.log('Saída adicionada:', mov.quantidade, 'em', dataStr)
                }
              } else {
                console.log('Data não encontrada nos últimos 7 dias:', dataStr)
              }
            }
          })
        }

        console.log('Movimentações 7 dias (final):', ultimos7Dias)

        graficosMovimentacoes.value = {
          labels: ultimos7Dias.map((d) => d.label),
          datasets: [
            {
              label: 'Entradas',
              data: ultimos7Dias.map((d) => d.entradas),
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Saídas',
              data: ultimos7Dias.map((d) => d.saidas),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
            },
          ],
        }

        // Gráfico de Produtos por Categoria
        const produtosPorCategoria = {}
        if (produtoStore.produtos && Array.isArray(produtoStore.produtos)) {
          produtoStore.produtos.forEach((produto) => {
            const categoria =
              categoriaStore.categorias &&
              categoriaStore.categorias.find((c) => c.id === produto.categoriaId)
            const nomeCategoria = categoria?.nome || 'Sem Categoria'
            produtosPorCategoria[nomeCategoria] = (produtosPorCategoria[nomeCategoria] || 0) + 1
          })
        }

        const labelsCategorias = Object.keys(produtosPorCategoria)
        const dataCategorias = Object.values(produtosPorCategoria)

        console.log('Produtos por Categoria:', { labelsCategorias, dataCategorias })

        const cores = [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ]

        graficosProdutosCategorias.value = {
          labels: labelsCategorias.length > 0 ? labelsCategorias : ['Sem Dados'],
          datasets: [
            {
              data: dataCategorias.length > 0 ? dataCategorias : [0],
              backgroundColor: cores,
              borderColor: cores.map((c) => c.replace('0.7', '1')),
              borderWidth: 1,
            },
          ],
        }

        console.log('Todos os gráficos carregados!')
      } catch (erro) {
        console.error('Erro ao carregar gráficos:', erro)
      } finally {
        loadingGraficos.value = false
      }
    }

    onMounted(() => {
      carregarEstatisticas()
      carregarGraficos()
    })

    return {
      loadingEstatisticas,
      loadingGraficos,
      estatisticas,
      graficosPedidosStatus,
      graficosTopProdutos,
      graficosMovimentacoes,
      graficosProdutosCategorias,
      optionsGraficoPizza,
      optionsGraficoBarra,
      optionsGraficoLinha,
    }
  },
}
