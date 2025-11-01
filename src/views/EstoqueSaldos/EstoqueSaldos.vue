<template>
  <div class="p-6">
    <!-- Cabeçalho -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Saldos de Estoque</h1>
        <p class="text-gray-600 mt-1">Visualize e gerencie os saldos de todos os produtos</p>
      </div>
      <button
        @click="abrirModalMovimentacao()"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        Nova Movimentação
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Busca por Nome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Buscar Produto </label>
          <input
            v-model="filtroLocal.produtoNome"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite o nome do produto..."
          />
        </div>

        <!-- Filtro Categoria -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Categoria </label>
          <select
            v-model="filtroLocal.categoriaId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="null">Todas as categorias</option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nome }}
            </option>
          </select>
        </div>

        <!-- Filtro Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Status do Estoque </label>
          <select
            v-model="filtroLocal.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="null">Todos os status</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Botões de Filtro -->
      <div class="flex gap-2 mt-4">
        <button
          @click="aplicarFiltros"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i class="fas fa-search mr-2"></i>
          Filtrar
        </button>
        <button
          @click="limparFiltros"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <i class="fas fa-times mr-2"></i>
          Limpar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="estoqueStore.carregandoSaldos" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Produto
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Categoria
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Saldo Atual
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Min / Máx
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Valor Unit.
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Valor Total
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="saldosFiltrados.length === 0">
              <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                <i class="fas fa-inbox text-4xl mb-3 block"></i>
                <p class="text-lg font-medium mb-2">Nenhum produto encontrado</p>
                <p class="text-sm">
                  <span
                    v-if="filtroLocal.produtoNome || filtroLocal.categoriaId || filtroLocal.status"
                  >
                    Tente ajustar os filtros ou
                    <button @click="limparFiltros" class="text-blue-600 hover:underline">
                      limpe os filtros
                    </button>
                  </span>
                  <span v-else>
                    Cadastre produtos e registre movimentações de entrada para visualizar saldos
                    aqui
                  </span>
                </p>
              </td>
            </tr>
            <tr
              v-for="saldo in saldosFiltrados"
              :key="saldo.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Produto -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ saldo.produtoNome }}</div>
                    <div class="text-xs text-gray-500">
                      {{ saldo.lotes?.length || 0 }} lote(s)
                    </div>
                  </div>
                </div>
              </td>

              <!-- Categoria -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ saldo.categoriaNome }}
                </span>
              </td>

              <!-- Saldo Atual -->
              <td class="px-6 py-4 text-center">
                <div class="text-lg font-bold text-gray-900">{{ saldo.saldoAtual }}</div>
                <!-- Barra de Progresso -->
                <div class="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    :class="[
                      'h-1.5 rounded-full',
                      obterCorProgresso(estoqueStore.obterStatusEstoque(saldo)),
                    ]"
                    :style="{ width: obterProgresso(saldo) + '%' }"
                  ></div>
                </div>
              </td>

              <!-- Min / Máx -->
              <td class="px-6 py-4 text-center">
                <div class="text-xs text-gray-600">
                  <div>
                    Mín: <span class="font-medium">{{ saldo.estoqueMinimo }}</span>
                  </div>
                  <div>
                    Máx: <span class="font-medium">{{ saldo.estoqueMaximo }}</span>
                  </div>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    estoqueStore.obterCorStatus(estoqueStore.obterStatusEstoque(saldo)),
                  ]"
                >
                  {{ estoqueStore.obterLabelStatus(estoqueStore.obterStatusEstoque(saldo)) }}
                </span>
              </td>

              <!-- Valor Unitário -->
              <td class="px-6 py-4 text-right">
                <span class="text-sm text-gray-900">{{ formatarMoeda(saldo.valorUnitario) }}</span>
              </td>

              <!-- Valor Total -->
              <td class="px-6 py-4 text-right">
                <span class="text-sm font-medium text-gray-900">{{
                  formatarMoeda(calcularValorTotal(saldo))
                }}</span>
              </td>

              <!-- Ações -->
              <td class="px-6 py-4 text-center">
                <button
                  @click="abrirModalMovimentacao(saldo)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Registrar Movimentação"
                >
                  <i class="fas fa-exchange-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Movimentação -->
    <MovimentacaoModal
      :show="mostrarModal"
      :produtoSelecionado="produtoParaMovimentar"
      @close="fecharModal"
      @salvo="movimentacaoSalva"
    />
  </div>
</template>

<script src="./EstoqueSaldos.js"></script>
