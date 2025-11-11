<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Relatório de Rentabilidade</h1>
      <p class="text-gray-600">Análise de margem de lucro e rentabilidade dos produtos</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Produto</label>
          <input
            v-model="filtros.produto"
            type="text"
            placeholder="Nome do produto..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <select
            v-model="filtros.categoriaId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
              {{ cat.nome }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
          <select
            v-model="filtros.ordenarPor"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="margem">Maior Margem</option>
            <option value="lucro">Maior Lucro</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="carregarDados"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i class="fas fa-search mr-2"></i>Buscar
          </button>
        </div>
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Margem Média</p>
            <p class="text-2xl font-bold text-blue-600">{{ resumo.margemMedia.toFixed(1) }}%</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <i class="fas fa-percentage text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Lucro Total</p>
            <p class="text-2xl font-bold text-green-600">{{ formatarMoeda(resumo.lucroTotal) }}</p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <i class="fas fa-dollar-sign text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Produtos Analisados</p>
            <p class="text-2xl font-bold text-gray-900">{{ resumo.totalProdutos }}</p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <i class="fas fa-box text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Vendas Totais</p>
            <p class="text-2xl font-bold text-indigo-600">
              {{ formatarMoeda(resumo.vendasTotais) }}
            </p>
          </div>
          <div class="bg-indigo-100 p-3 rounded-full">
            <i class="fas fa-chart-line text-indigo-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráfico de Rentabilidade -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
        Top 10 Produtos - Margem de Lucro
      </h3>
      <div class="h-80">
        <BaseChart
          v-if="chartData.labels.length > 0"
          chart-id="rentabilidadeChart"
          type="bar"
          :data="chartData"
          :options="chartOptions"
        />
        <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
          <i class="fas fa-chart-bar text-6xl mb-4"></i>
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    </div>

    <!-- Tabela de Produtos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          <i class="fas fa-table mr-2 text-blue-600"></i>
          Análise Detalhada por Produto
        </h3>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        <span class="ml-2 text-gray-600">Carregando...</span>
      </div>

      <div v-else-if="produtos.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Produto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Categoria
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Custo
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Preço Venda
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Lucro Unit.
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Margem %
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Qtd. Vendida
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Lucro Total
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="produto in produtos" :key="produto.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ produto.nome }}</p>
                  <p class="text-xs text-gray-500">Cód: {{ produto.codigo }}</p>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ produto.categoriaNome || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-right text-gray-900">
                {{ formatarMoeda(produto.custo) }}
              </td>
              <td class="px-6 py-4 text-sm text-right text-gray-900">
                {{ formatarMoeda(produto.preco) }}
              </td>
              <td class="px-6 py-4 text-sm text-right font-medium text-green-600">
                {{ formatarMoeda(produto.lucroUnitario) }}
              </td>
              <td class="px-6 py-4 text-right">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    obterCorMargem(produto.margemLucro),
                  ]"
                >
                  {{ produto.margemLucro.toFixed(1) }}%
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-right text-gray-900">
                {{ produto.quantidadeVendida || 0 }}
              </td>
              <td class="px-6 py-4 text-sm text-right font-bold text-green-600">
                {{ formatarMoeda(produto.lucroTotal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-12">
        <i class="fas fa-box-open text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
        <p class="text-gray-600">Ajuste os filtros e tente novamente</p>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
