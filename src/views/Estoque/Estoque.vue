<template>
  <div class="p-6">
    <!-- Cabeçalho -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Histórico de Movimentações</h1>
        <p class="text-gray-600 mt-1">Consulte todas as movimentações de estoque realizadas</p>
      </div>
      <button
        @click="abrirModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        Nova Movimentação
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Filtro Produto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Produto </label>
          <select
            v-model="filtroLocal.produtoId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="null">Todos os produtos</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
              {{ produto.nome }}
            </option>
          </select>
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

        <!-- Filtro Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Tipo de Movimentação </label>
          <select
            v-model="filtroLocal.tipoMovimentacao"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="null">Todos os tipos</option>
            <option v-for="tipo in tiposMovimentacao" :key="tipo.value" :value="tipo.value">
              {{ tipo.label }}
            </option>
          </select>
        </div>

        <!-- Filtro Data Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Data Início </label>
          <input
            type="date"
            v-model="filtroLocal.dataInicio"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Filtro Data Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Data Fim </label>
          <input
            type="date"
            v-model="filtroLocal.dataFim"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
    <div v-if="estoqueStore.carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Controles -->
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Mostrando {{ estoqueStore.totalItens }} movimentação(ões)
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Itens por página:</label>
          <select
            :value="estoqueStore.itensPorPagina"
            @change="mudarItensPorPagina"
            class="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Tabela de Movimentações -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="ordenar('dataMovimentacao')"
              >
                <div class="flex items-center gap-2">
                  Data
                  <i class="fas fa-sort text-gray-400"></i>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="ordenar('tipoMovimentacao')"
              >
                <div class="flex items-center gap-2">
                  Tipo
                  <i class="fas fa-sort text-gray-400"></i>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="ordenar('produtoNome')"
              >
                <div class="flex items-center gap-2">
                  Produto
                  <i class="fas fa-sort text-gray-400"></i>
                </div>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lote
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Validade
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantidade
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuário
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Observações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="movimentacoesFiltradas.length === 0">
              <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <p>Nenhuma movimentação encontrada</p>
              </td>
            </tr>
            <tr
              v-for="movimento in movimentacoesFiltradas"
              :key="movimento.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Data -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatarData(movimento.dataMovimentacao) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatarHora(movimento.dataMovimentacao) }}
                </div>
              </td>

              <!-- Tipo -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    getCorTipo(movimento.tipoMovimentacao),
                    movimento.tipoMovimentacao === 'ENTRADA'
                      ? 'bg-green-100'
                      : movimento.tipoMovimentacao === 'SAIDA'
                        ? 'bg-red-100'
                        : 'bg-yellow-100',
                  ]"
                >
                  <i :class="['fas', getIconeTipo(movimento.tipoMovimentacao), 'mr-1']"></i>
                  {{ getLabelTipo(movimento.tipoMovimentacao) }}
                </span>
              </td>

              <!-- Produto -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ movimento.produtoNome }}</div>
                <div class="text-xs text-gray-500">{{ movimento.categoriaNome }}</div>
              </td>

              <!-- Lote -->
              <td class="px-6 py-4">
                <div v-if="movimento.lote" class="text-sm text-gray-900">
                  <i class="fas fa-barcode mr-1 text-gray-400"></i>
                  {{ movimento.lote }}
                </div>
                <div v-else class="text-sm text-gray-400">-</div>
              </td>

              <!-- Validade -->
              <td class="px-6 py-4">
                <div v-if="movimento.dataValidade" class="text-sm text-gray-900">
                  <i class="fas fa-calendar-alt mr-1 text-gray-400"></i>
                  {{ formatarData(movimento.dataValidade) }}
                </div>
                <div v-else class="text-sm text-gray-400">-</div>
              </td>

              <!-- Quantidade -->
              <td class="px-6 py-4 text-center">
                <span
                  :class="[
                    'text-lg font-bold',
                    movimento.tipoMovimentacao === 'SAIDA'
                      ? 'text-red-600'
                      : movimento.tipoMovimentacao === 'ENTRADA'
                        ? 'text-green-600'
                        : 'text-yellow-600',
                  ]"
                >
                  {{
                    movimento.tipoMovimentacao === 'SAIDA'
                      ? '-'
                      : movimento.tipoMovimentacao === 'ENTRADA'
                        ? '+'
                        : '±'
                  }}{{ Math.abs(movimento.quantidade) }}
                </span>
              </td>

              <!-- Usuário -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  <i class="fas fa-user mr-1 text-gray-400"></i>
                  {{ movimento.usuarioNome }}
                </div>
              </td>

              <!-- Observações -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700">
                  {{ movimento.observacoes || '-' }}
                  <span v-if="movimento.pedidoId" class="ml-2 text-blue-600 text-xs">
                    <i class="fas fa-shopping-cart mr-1"></i>
                    Pedido #{{ movimento.pedidoId.substring(0, 8) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div v-if="estoqueStore.totalPaginas > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Página {{ estoqueStore.paginaAtual }} de {{ estoqueStore.totalPaginas }}
          </div>
          <div class="flex gap-2">
            <button
              @click="mudarPagina(estoqueStore.paginaAtual - 1)"
              :disabled="estoqueStore.paginaAtual === 1"
              :class="[
                'px-3 py-1 rounded-lg transition-colors',
                estoqueStore.paginaAtual === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <button
              v-for="pagina in paginasVisiveis"
              :key="pagina"
              @click="pagina !== '...' && mudarPagina(pagina)"
              :disabled="pagina === '...'"
              :class="[
                'px-3 py-1 rounded-lg transition-colors min-w-[40px]',
                pagina === estoqueStore.paginaAtual
                  ? 'bg-blue-600 text-white'
                  : pagina === '...'
                    ? 'bg-transparent text-gray-400 cursor-default'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              {{ pagina }}
            </button>

            <button
              @click="mudarPagina(estoqueStore.paginaAtual + 1)"
              :disabled="estoqueStore.paginaAtual === estoqueStore.totalPaginas"
              :class="[
                'px-3 py-1 rounded-lg transition-colors',
                estoqueStore.paginaAtual === estoqueStore.totalPaginas
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Movimentação -->
    <MovimentacaoModal :show="mostrarModal" @close="fecharModal" @salvo="movimentacaoSalva" />
  </div>
</template>

<script src="./Estoque.js"></script>
