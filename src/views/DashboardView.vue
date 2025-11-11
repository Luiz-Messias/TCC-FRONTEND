<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Bem-vindo ao Arcca Bebidas</h1>

    <!-- Grid de Ações Rápidas -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <!-- Realizar Pedido -->
      <router-link to="/pedido/novo">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-plus-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Novo</h3>
              <p class="text-sm text-gray-600">Pedido</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Ver Pedidos -->
      <router-link to="/pedidos">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Ver</h3>
              <p class="text-sm text-gray-600">Pedidos</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Devolução de Produtos -->
      <router-link to="/devolucoes">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-undo text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Devolução</h3>
              <p class="text-sm text-gray-600">de Produtos</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Conversão de Unidades -->
      <router-link to="/conversao-unidades">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-exchange-alt text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Converter</h3>
              <p class="text-sm text-gray-600">Unidades</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Dashboard de Estoque -->
      <router-link to="/estoque/dashboard">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-warehouse text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Dashboard</h3>
              <p class="text-sm text-gray-600">Estoque</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Relatórios -->
      <router-link to="/relatorios">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-chart-bar text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Ver</h3>
              <p class="text-sm text-gray-600">Relatórios</p>
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Cards de Estatísticas -->
    <div v-if="!loadingEstatisticas" class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total de Pedidos</p>
            <p class="text-2xl font-bold text-gray-800">{{ estatisticas.totalPedidos }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Produtos Cadastrados</p>
            <p class="text-2xl font-bold text-gray-800">{{ estatisticas.totalProdutos }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-box text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Clientes Ativos</p>
            <p class="text-2xl font-bold text-gray-800">{{ estatisticas.totalClientes }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-users text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Movimentações</p>
            <p class="text-2xl font-bold text-gray-800">{{ estatisticas.totalMovimentacoes }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-exchange-alt text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div v-if="!loadingGraficos" class="grid grid-cols-2 gap-6 mb-8">
      <!-- Gráfico de Pedidos por Status -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Pedidos por Status</h3>
        <BaseChart
          v-if="graficosPedidosStatus.labels && graficosPedidosStatus.labels.length > 0"
          chartId="pedidosStatusChart"
          type="pie"
          :data="graficosPedidosStatus"
          :options="optionsGraficoPizza"
        />
        <div v-else class="flex items-center justify-center h-80 text-gray-400">
          <p>Sem dados disponíveis</p>
        </div>
      </div>

      <!-- Gráfico de Top 5 Produtos Mais Vendidos -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top 5 Produtos Mais Vendidos</h3>
        <BaseChart
          v-if="graficosTopProdutos.labels && graficosTopProdutos.labels.length > 0"
          chartId="topProdutosChart"
          type="bar"
          :data="graficosTopProdutos"
          :options="optionsGraficoBarra"
        />
        <div v-else class="flex items-center justify-center h-80 text-gray-400">
          <p>Sem dados disponíveis</p>
        </div>
      </div>

      <!-- Gráfico de Movimentações de Estoque -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Movimentações de Estoque (Últimos 7 Dias)
        </h3>
        <BaseChart
          chartId="movimentacoesChart"
          type="line"
          :data="graficosMovimentacoes"
          :options="optionsGraficoLinha"
        />
      </div>

      <!-- Gráfico de Produtos por Categoria -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Produtos por Categoria</h3>
        <BaseChart
          v-if="graficosProdutosCategorias.labels && graficosProdutosCategorias.labels.length > 0"
          chartId="produtosCategoriasChart"
          type="doughnut"
          :data="graficosProdutosCategorias"
          :options="optionsGraficoPizza"
        />
        <div v-else class="flex items-center justify-center h-80 text-gray-400">
          <p>Sem dados disponíveis</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./DashboardView.js"></script>
