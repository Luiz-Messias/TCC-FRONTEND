<template>
  <div class="p-6">
    <!-- Cabeçalho -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard de Estoque</h1>
      <p class="text-gray-600 mt-1">Visão geral do estoque e alertas importantes</p>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Total de Produtos -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total de Produtos</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ totalProdutos }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i class="fas fa-box text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- Valor Total do Estoque -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Valor Total</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">{{ formatarMoeda(valorTotal) }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i class="fas fa-dollar-sign text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- Produtos com Estoque Baixo -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Estoque Baixo</p>
            <p class="text-3xl font-bold text-yellow-600 mt-2">{{ produtosBaixos.length }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>

      <!-- Produtos Críticos -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Estoque Crítico</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ produtosCriticos.length }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de Alertas e Movimentações -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Produtos com Estoque Baixo -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">
            <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
            Produtos com Estoque Baixo
          </h2>
        </div>
        <div class="p-6">
          <div v-if="produtosBaixos.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-check-circle text-4xl text-green-500 mb-2"></i>
            <p>Todos os produtos estão com estoque adequado</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="produto in produtosBaixos.slice(0, 5)"
              :key="produto.id"
              class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ produto.produtoNome }}</div>
                <div class="text-sm text-gray-600">{{ produto.categoriaNome }}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-yellow-600">{{ produto.saldoAtual }}</div>
                <div class="text-xs text-gray-500">Mín: {{ produto.estoqueMinimo }}</div>
              </div>
            </div>
            <div v-if="produtosBaixos.length > 5" class="text-center pt-2">
              <router-link to="/estoque/saldos" class="text-blue-600 hover:text-blue-800 text-sm">
                Ver todos ({{ produtosBaixos.length }})
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Produtos Próximos ao Vencimento -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">
            <i class="fas fa-calendar-exclamation text-red-600 mr-2"></i>
            Próximos ao Vencimento
          </h2>
        </div>
        <div class="p-6">
          <div v-if="produtosVencimento.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-check-circle text-4xl text-green-500 mb-2"></i>
            <p>Nenhum produto próximo ao vencimento</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="produto in produtosVencimento.slice(0, 5)"
              :key="produto.lote"
              :class="[
                'flex items-center justify-between p-3 rounded-lg border',
                produto.diasRestantes <= 7
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200',
              ]"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ produto.produtoNome }}</div>
                <div class="text-sm text-gray-600">
                  <i class="fas fa-barcode mr-1"></i>
                  Lote: {{ produto.lote }}
                </div>
              </div>
              <div class="text-right">
                <div
                  :class="[
                    'text-lg font-bold',
                    produto.diasRestantes <= 7 ? 'text-red-600' : 'text-yellow-600',
                  ]"
                >
                  {{ produto.diasRestantes }} dias
                </div>
                <div class="text-xs text-gray-500">{{ formatarData(produto.dataValidade) }}</div>
              </div>
            </div>
            <div v-if="produtosVencimento.length > 5" class="text-center pt-2">
              <router-link
                to="/estoque/movimentacoes"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                Ver todos ({{ produtosVencimento.length }})
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Movimentações Recentes -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-800">
          <i class="fas fa-history text-blue-600 mr-2"></i>
          Movimentações Recentes
        </h2>
        <router-link to="/estoque/movimentacoes" class="text-blue-600 hover:text-blue-800 text-sm">
          Ver todas
          <i class="fas fa-arrow-right ml-1"></i>
        </router-link>
      </div>
      <div class="p-6">
        <div v-if="movimentacoesRecentes.length === 0" class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p>Nenhuma movimentação recente</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="movimento in movimentacoesRecentes"
            :key="movimento.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4 flex-1">
              <!-- Ícone do Tipo -->
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  movimento.tipoMovimentacao === 'ENTRADA'
                    ? 'bg-green-100'
                    : movimento.tipoMovimentacao === 'SAIDA'
                      ? 'bg-red-100'
                      : 'bg-yellow-100',
                ]"
              >
                <i :class="['fas', getIconeTipo(movimento.tipoMovimentacao)]"></i>
              </div>

              <!-- Informações -->
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">{{ movimento.produtoNome }}</span>
                  <span class="text-xs text-gray-500">•</span>
                  <span class="text-sm text-gray-600">{{
                    getLabelTipo(movimento.tipoMovimentacao)
                  }}</span>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ movimento.observacoes || 'Sem observações' }}
                </div>
              </div>

              <!-- Quantidade e Data -->
              <div class="text-right">
                <div
                  :class="[
                    'text-lg font-bold',
                    movimento.tipoMovimentacao === 'ENTRADA'
                      ? 'text-green-600'
                      : movimento.tipoMovimentacao === 'SAIDA'
                        ? 'text-red-600'
                        : 'text-yellow-600',
                  ]"
                >
                  {{ movimento.tipoMovimentacao === 'SAIDA' ? '-' : '+' }}{{ movimento.quantidade }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatarData(movimento.dataMovimentacao) }}
                  {{ formatarHora(movimento.dataMovimentacao) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./EstoqueDashboard.js"></script>
