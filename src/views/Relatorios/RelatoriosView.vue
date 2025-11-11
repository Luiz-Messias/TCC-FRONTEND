<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Relatórios</h1>
      <p class="text-gray-600">Visualize estatísticas e análises do sistema</p>
    </div>

    <!-- Filtros de Período -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
          <select
            v-model="periodoSelecionado"
            @change="carregarRelatorios"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mes">Últimos 30 dias</option>
            <option value="trimestre">Últimos 90 dias</option>
            <option value="ano">Último ano</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        <div v-if="periodoSelecionado === 'personalizado'" class="flex gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
            <input
              v-model="dataInicio"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
            <input
              v-model="dataFim"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="carregarRelatorios"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i class="fas fa-sync mr-2"></i>Atualizar
          </button>
          <button
            @click="exportarPDF"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <i class="fas fa-file-pdf mr-2"></i>PDF
          </button>
          <button
            @click="exportarExcel"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i class="fas fa-file-excel mr-2"></i>Excel
          </button>
        </div>
      </div>
      <div class="mt-2 text-sm text-gray-600">
        <i class="fas fa-calendar mr-2"></i>{{ periodoFormatado }}
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
      <span class="ml-2 text-gray-600">Carregando relatórios...</span>
    </div>

    <div v-else>
      <!-- Cards de Estatísticas - Pedidos -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Pedidos e Vendas</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total de Pedidos</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ estatisticasPedidos.totalPedidos }}
                </p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Orçamentos</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ estatisticasPedidos.totalOrcamentos }}
                </p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <i class="fas fa-file-invoice text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total em Vendas</p>
                <p class="text-2xl font-bold text-green-600">
                  {{ formatarMoeda(estatisticasPedidos.totalVendas) }}
                </p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <i class="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Ticket Médio</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatarMoeda(estatisticasPedidos.ticketMedio) }}
                </p>
              </div>
              <div class="bg-yellow-100 p-3 rounded-full">
                <i class="fas fa-chart-line text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status dos Pedidos -->
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Status dos Pedidos</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="bg-yellow-100 p-3 rounded-full mr-4">
                <i class="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Ativos</p>
                <p class="text-2xl font-bold text-yellow-600">
                  {{ estatisticasPedidos.pedidosAtivos }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="bg-green-100 p-3 rounded-full mr-4">
                <i class="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Concluídos</p>
                <p class="text-2xl font-bold text-green-600">
                  {{ estatisticasPedidos.pedidosConcluidos }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="bg-red-100 p-3 rounded-full mr-4">
                <i class="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Cancelados</p>
                <p class="text-2xl font-bold text-red-600">
                  {{ estatisticasPedidos.pedidosCancelados }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estatísticas de Produtos e Estoque -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Produtos -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Produtos</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Total de Produtos</span>
              <span class="font-bold text-gray-900">{{ estatisticasProdutos.totalProdutos }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Produtos Ativos</span>
              <span class="font-bold text-green-600">{{
                estatisticasProdutos.produtosAtivos
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Produtos Inativos</span>
              <span class="font-bold text-red-600">{{
                estatisticasProdutos.produtosInativos
              }}</span>
            </div>
          </div>
        </div>

        <!-- Estoque -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Alertas de Estoque</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Estoque Baixo</span>
              <span class="font-bold text-yellow-600">{{
                estatisticasEstoque.produtosBaixoEstoque
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Estoque Crítico</span>
              <span class="font-bold text-red-600">{{ estatisticasEstoque.produtosCriticos }}</span>
            </div>
            <router-link
              to="/estoque/dashboard"
              class="block text-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ver Dashboard de Estoque
            </router-link>
          </div>
        </div>
      </div>

      <!-- Top Produtos -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Top 5 Produtos Mais Vendidos</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Posição
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendas
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receita
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(produto, index) in topProdutos" :key="index">
                <td class="px-6 py-4 text-sm text-gray-900">#{{ index + 1 }}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ produto.nome }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ produto.vendas }} unidades</td>
                <td class="px-6 py-4 text-sm text-green-600 font-medium">
                  R$ {{ produto.receita.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Movimentações Recentes -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Últimas Movimentações de Estoque</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantidade
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="mov in movimentacoesRecentes" :key="mov.id">
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ new Date(mov.dataMovimentacao).toLocaleDateString('pt-BR') }}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ mov.produtoNome }}</td>
                <td class="px-6 py-4 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      mov.tipoMovimentacao === 'ENTRADA'
                        ? 'bg-green-100 text-green-800'
                        : mov.tipoMovimentacao === 'SAIDA'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800',
                    ]"
                  >
                    {{ mov.tipoMovimentacao }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ mov.quantidade }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
