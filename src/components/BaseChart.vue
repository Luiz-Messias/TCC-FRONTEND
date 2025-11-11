<template>
  <div class="chart-container">
    <canvas :id="chartId"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController,
)

export default {
  name: 'BaseChart',
  props: {
    chartId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ['bar', 'line', 'pie', 'doughnut'].includes(value),
    },
    data: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    console.log('BaseChart montado:', this.chartId, 'Tipo:', this.type)
    console.log('Dados do gráfico:', this.data)
    this.$nextTick(() => {
      this.renderChart()
    })
  },
  watch: {
    data: {
      deep: true,
      handler() {
        console.log('Dados atualizados para:', this.chartId, this.data)
        this.updateChart()
      },
    },
  },
  methods: {
    renderChart() {
      const ctx = document.getElementById(this.chartId)
      console.log('Canvas encontrado:', ctx, 'para chartId:', this.chartId)

      if (!ctx) {
        console.error('Canvas não encontrado para:', this.chartId)
        return
      }

      // Verificar se há dados válidos
      if (!this.data || !this.data.labels) {
        console.warn('Dados vazios ou inválidos para:', this.chartId, this.data)
        return
      }

      // Para gráficos de linha, permitir labels mesmo com dados zerados
      if (this.type !== 'line' && this.data.labels.length === 0) {
        console.warn('Sem labels para gráfico:', this.chartId)
        return
      }

      // Destruir gráfico anterior se existir
      if (this.chart) {
        this.chart.destroy()
      }

      try {
        this.chart = new Chart(ctx, {
          type: this.type,
          data: this.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...this.options,
          },
        })
        console.log('Gráfico criado com sucesso:', this.chartId)
      } catch (error) {
        console.error('Erro ao criar gráfico:', this.chartId, error)
      }
    },
    updateChart() {
      if (!this.chart) {
        console.log('Gráfico não existe ainda, tentando renderizar:', this.chartId)
        this.renderChart()
        return
      }

      if (!this.data || !this.data.labels) {
        console.warn('Tentativa de atualizar com dados vazios:', this.chartId)
        return
      }

      // Para gráficos de linha, permitir labels mesmo com dados zerados
      if (this.type !== 'line' && this.data.labels.length === 0) {
        console.warn('Sem labels para atualizar:', this.chartId)
        return
      }

      try {
        this.chart.data = this.data
        this.chart.update()
        console.log('Gráfico atualizado:', this.chartId)
      } catch (error) {
        console.error('Erro ao atualizar gráfico:', this.chartId, error)
      }
    },
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}
</style>
