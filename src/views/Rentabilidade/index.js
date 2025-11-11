import { ref, onMounted, computed } from 'vue'
import { useProdutoStore } from '@/stores/produtoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { usePedidoStore } from '@/stores/pedidoStore'
import BaseChart from '@/components/BaseChart.vue'

export default {
  name: 'RentabilidadeView',
  components: {
    BaseChart,
  },
  setup() {
    const produtoStore = useProdutoStore()
    const categoriaStore = useCategoriaStore()
    const pedidoStore = usePedidoStore()

    const loading = ref(false)
    const produtos = ref([])
    const categorias = ref([])

    const filtros = ref({
      produto: '',
      categoriaId: '',
      ordenarPor: 'margem',
    })

    const resumo = ref({
      margemMedia: 0,
      lucroTotal: 0,
      totalProdutos: 0,
      vendasTotais: 0,
    })

    const chartData = computed(() => {
      const top10 = produtos.value.slice(0, 10)
      return {
        labels: top10.map((p) => p.nome),
        datasets: [
          {
            label: 'Margem de Lucro (%)',
            data: top10.map((p) => p.margemLucro),
            backgroundColor: top10.map((p) => {
              if (p.margemLucro >= 30) return 'rgba(34, 197, 94, 0.7)' // Verde
              if (p.margemLucro >= 15) return 'rgba(59, 130, 246, 0.7)' // Azul
              return 'rgba(239, 68, 68, 0.7)' // Vermelho
            }),
            borderColor: top10.map((p) => {
              if (p.margemLucro >= 30) return 'rgb(34, 197, 94)'
              if (p.margemLucro >= 15) return 'rgb(59, 130, 246)'
              return 'rgb(239, 68, 68)'
            }),
            borderWidth: 1,
          },
        ],
      }
    })

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Margem: ${context.parsed.y.toFixed(1)}%`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Margem (%)',
          },
        },
      },
    }

    const carregarDados = async () => {
      loading.value = true
      try {
        // Carregar produtos
        await produtoStore.listarProdutos()
        let produtosData = [...produtoStore.produtos]

        // Carregar pedidos para obter quantidade vendida
        await pedidoStore.listarPedidos()
        const pedidos = pedidoStore.pedidos

        // Calcular vendas por produto
        const vendasPorProduto = {}
        pedidos.forEach((pedido) => {
          if (pedido.status === 'CONCLUIDO' || pedido.status === 1) {
            pedido.itens?.forEach((item) => {
              if (!vendasPorProduto[item.produtoId]) {
                vendasPorProduto[item.produtoId] = 0
              }
              vendasPorProduto[item.produtoId] += item.quantidade || 0
            })
          }
        })

        // Calcular rentabilidade
        produtosData = produtosData.map((p) => {
          const custo = parseFloat(p.custo) || 0
          const preco = parseFloat(p.preco) || 0
          const lucroUnitario = preco - custo
          const margemLucro = preco > 0 ? (lucroUnitario / preco) * 100 : 0
          const quantidadeVendida = vendasPorProduto[p.id] || 0
          const lucroTotal = lucroUnitario * quantidadeVendida

          return {
            ...p,
            custo,
            preco,
            lucroUnitario,
            margemLucro,
            quantidadeVendida,
            lucroTotal,
          }
        })

        // Aplicar filtros
        if (filtros.value.produto) {
          produtosData = produtosData.filter((p) =>
            p.nome.toLowerCase().includes(filtros.value.produto.toLowerCase()),
          )
        }

        if (filtros.value.categoriaId) {
          produtosData = produtosData.filter(
            (p) => p.categoriaId === parseInt(filtros.value.categoriaId),
          )
        }

        // Ordenar
        if (filtros.value.ordenarPor === 'margem') {
          produtosData.sort((a, b) => b.margemLucro - a.margemLucro)
        } else if (filtros.value.ordenarPor === 'lucro') {
          produtosData.sort((a, b) => b.lucroTotal - a.lucroTotal)
        } else {
          produtosData.sort((a, b) => a.nome.localeCompare(b.nome))
        }

        produtos.value = produtosData

        // Calcular resumo
        const totalProdutos = produtosData.length
        const somaMargens = produtosData.reduce((sum, p) => sum + p.margemLucro, 0)
        const somaLucros = produtosData.reduce((sum, p) => sum + p.lucroTotal, 0)
        const somaVendas = produtosData.reduce((sum, p) => sum + p.preco * p.quantidadeVendida, 0)

        resumo.value = {
          margemMedia: totalProdutos > 0 ? somaMargens / totalProdutos : 0,
          lucroTotal: somaLucros,
          totalProdutos,
          vendasTotais: somaVendas,
        }
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro)
      } finally {
        loading.value = false
      }
    }

    const carregarCategorias = async () => {
      try {
        await categoriaStore.listarCategorias()
        categorias.value = categoriaStore.categorias
      } catch (erro) {
        console.error('Erro ao carregar categorias:', erro)
      }
    }

    const formatarMoeda = (valor) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor || 0)
    }

    const obterCorMargem = (margem) => {
      if (margem >= 30) return 'bg-green-100 text-green-800'
      if (margem >= 15) return 'bg-blue-100 text-blue-800'
      return 'bg-red-100 text-red-800'
    }

    onMounted(() => {
      carregarCategorias()
      carregarDados()
    })

    return {
      loading,
      produtos,
      categorias,
      filtros,
      resumo,
      chartData,
      chartOptions,
      carregarDados,
      formatarMoeda,
      obterCorMargem,
    }
  },
}
