<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Pedidos</h1>
      <p class="text-gray-600">Visualize e gerencie todos os pedidos realizados</p>
    </div>

    <!-- Filtros e Ações -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <!-- Filtro por Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            v-model="filtroTipo"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">Todos</option>
            <option :value="0">Orçamentos</option>
            <option :value="1">Pedidos</option>
          </select>
        </div>

        <!-- Filtro por Cliente -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <select
            v-model="filtroCliente"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">Todos os clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nome }}
            </option>
          </select>
        </div>

        <!-- Filtro por Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filtroStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <!-- Data Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
          <input
            v-model="dataInicio"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Data Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
          <input
            v-model="dataFim"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Itens por Página -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Itens por página</label>
          <select
            v-model.number="itensPorPagina"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="aplicarFiltros"
          >
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Botões de ação -->
      <div class="flex gap-2">
        <button
          @click="aplicarFiltros"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <i class="fas fa-search mr-2"></i>
          Buscar
        </button>
        <button
          @click="limparFiltros"
          class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <i class="fas fa-times mr-2"></i>
          Limpar
        </button>
        <button
          @click="irParaNovoPedido"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <i class="fas fa-plus mr-2"></i>
          Novo Pedido
        </button>
      </div>
    </div>

    <!-- Tabela de pedidos -->
    <div class="bg-white rounded-lg shadow">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        <span class="ml-2 text-gray-600">Carregando pedidos...</span>
      </div>

      <!-- Tabela -->
      <div v-else-if="pedidos.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                @click="alterarOrdenacao('pedidoId')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                ID
                <i
                  v-if="ordenacao.campo === 'pedidoId'"
                  :class="[
                    'fas',
                    'ml-1',
                    ordenacao.direcao === 'asc' ? 'fa-sort-up' : 'fa-sort-down',
                  ]"
                ></i>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cliente
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                @click="alterarOrdenacao('dataPedido')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Data do Pedido
                <i
                  v-if="ordenacao.campo === 'dataPedido'"
                  :class="[
                    'fas',
                    'ml-1',
                    ordenacao.direcao === 'asc' ? 'fa-sort-up' : 'fa-sort-down',
                  ]"
                ></i>
              </th>
              <th
                @click="alterarOrdenacao('total')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Total
                <i
                  v-if="ordenacao.campo === 'total'"
                  :class="[
                    'fas',
                    'ml-1',
                    ordenacao.direcao === 'asc' ? 'fa-sort-up' : 'fa-sort-down',
                  ]"
                ></i>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Qtd. Itens
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Observações
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pedido in pedidos" :key="pedido.pedidoId" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-mono text-gray-900">
                  {{ formatarId(pedido.pedidoId) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ obterNomeCliente(pedido.clienteId) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border',
                    pedidoStore.obterCorTipo(pedido.tipo),
                  ]"
                >
                  <i
                    :class="[
                      'fas mr-1.5',
                      pedido.tipo === 0 ? 'fa-file-invoice' : 'fa-shopping-cart',
                    ]"
                  ></i>
                  {{ pedidoStore.obterLabelTipo(pedido.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatarData(pedido.dataPedido) }}</div>
                <div class="text-xs text-gray-500">{{ formatarHora(pedido.dataPedido) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-green-600">
                  {{ formatarMoeda(pedido.total) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                >
                  {{ pedido.itens?.length || 0 }}
                  {{ pedido.itens?.length === 1 ? 'item' : 'itens' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border',
                    pedidoStore.obterCorStatus(pedido.status),
                  ]"
                >
                  <i :class="['fas mr-1.5', pedidoStore.obterIconeStatus(pedido.status)]"></i>
                  {{ pedidoStore.obterLabelStatus(pedido.status) }}
                </span>
              </td>
              <td class="px-6 py-4 max-w-xs">
                <div
                  v-if="pedido.observacoes"
                  class="text-sm text-gray-600 truncate"
                  :title="pedido.observacoes"
                >
                  {{ pedido.observacoes }}
                </div>
                <span v-else class="text-sm text-gray-400 italic">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button
                    @click="verDetalhes(pedido)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Ver detalhes"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    v-if="pedidoStore.podeConverterOrcamento(pedido)"
                    @click="confirmarConversao(pedido)"
                    class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                    title="Converter orçamento em pedido"
                  >
                    <i class="fas fa-exchange-alt"></i>
                  </button>
                  <button
                    v-if="pedidoStore.podeSerConcluido(pedido.status)"
                    @click="confirmarConclusao(pedido)"
                    class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                    title="Concluir pedido"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    v-if="pedidoStore.podeSerCancelado(pedido.status)"
                    @click="confirmarCancelamento(pedido)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Cancelar pedido"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                  <button
                    v-if="pedidoStore.podeSerReativado(pedido.status)"
                    @click="confirmarReativacao(pedido)"
                    class="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-100"
                    title="Reativar pedido"
                  >
                    <i class="fas fa-redo"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado vazio -->
      <div v-else class="text-center py-12">
        <i class="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
        <p class="text-gray-500 mb-4">Não há pedidos cadastrados no sistema</p>
        <button
          @click="irParaNovoPedido"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-plus mr-2"></i>
          Criar Primeiro Pedido
        </button>
      </div>

      <!-- Paginação -->
      <div
        v-if="pedidos.length > 0 && totalPaginas > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="paginaAtual > 1 && (paginaAtual--, listarPedidos())"
            :disabled="paginaAtual === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            @click="paginaAtual < totalPaginas && (paginaAtual++, listarPedidos())"
            :disabled="paginaAtual === totalPaginas"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (paginaAtual - 1) * itensPorPagina + 1 }}</span>
              até
              <span class="font-medium">{{
                Math.min(paginaAtual * itensPorPagina, totalItens)
              }}</span>
              de
              <span class="font-medium">{{ totalItens }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="paginaAtual > 1 && (paginaAtual--, listarPedidos())"
                :disabled="paginaAtual === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="pagina in gerarPaginas()"
                :key="pagina"
                @click="pagina !== '...' && ((paginaAtual = pagina), listarPedidos())"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  pagina === paginaAtual
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  pagina === '...' ? 'cursor-default' : 'cursor-pointer',
                ]"
              >
                {{ pagina }}
              </button>
              <button
                @click="paginaAtual < totalPaginas && (paginaAtual++, listarPedidos())"
                :disabled="paginaAtual === totalPaginas"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div
      v-if="pedidoDetalhes"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="fecharDetalhes"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h3 class="text-lg font-semibold">Detalhes do Pedido</h3>
          <button @click="fecharDetalhes" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <!-- Informações do Pedido -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">ID do Pedido</label>
              <p class="mt-1 text-sm text-gray-900 font-mono">
                {{ formatarId(pedidoDetalhes.pedidoId) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Cliente</label>
              <p class="mt-1 text-sm text-gray-900">
                {{ obterNomeCliente(pedidoDetalhes.clienteId) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Data do Pedido</label>
              <p class="mt-1 text-sm text-gray-900">
                {{ formatarDataCompleta(pedidoDetalhes.dataPedido) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Total</label>
              <p class="mt-1 text-lg font-semibold text-green-600">
                {{ formatarMoeda(pedidoDetalhes.total) }}
              </p>
            </div>
          </div>

          <!-- Observações -->
          <div v-if="pedidoDetalhes.observacoes" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <div class="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
              {{ pedidoDetalhes.observacoes }}
            </div>
          </div>

          <!-- Itens do Pedido -->
          <div>
            <h4 class="text-md font-semibold text-gray-900 mb-3">Itens do Pedido</h4>
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Produto
                    </th>
                    <th
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantidade
                    </th>
                    <th
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Preço Unit.
                    </th>
                    <th
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in pedidoDetalhes.itens" :key="item.itemPedidoId">
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {{ obterNomeProduto(item.produtoId) }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.quantidade }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {{ formatarMoeda(item.precoUnitario) }}
                    </td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900">
                      {{ formatarMoeda(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td
                      colspan="3"
                      class="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                    >
                      Total:
                    </td>
                    <td class="px-4 py-3 text-sm font-bold text-green-600">
                      {{ formatarMoeda(pedidoDetalhes.total) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Metadados -->
          <div class="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span class="font-medium">Criado em:</span>
              {{ formatarDataCompleta(pedidoDetalhes.dataCriacao) }}
            </div>
            <div>
              <span class="font-medium">Atualizado em:</span>
              {{ formatarDataCompleta(pedidoDetalhes.dataAtualizacao) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de cancelamento -->
    <div
      v-if="pedidoParaCancelar"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
          >
            <i class="fas fa-times-circle text-red-600"></i>
          </div>
        </div>
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Cancelar Pedido</h3>
          <p class="text-sm text-gray-500 mb-4">
            Tem certeza que deseja cancelar o pedido
            <strong>{{ formatarId(pedidoParaCancelar.pedidoId) }}</strong
            >? O pedido será marcado como cancelado.
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="pedidoParaCancelar = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            @click="cancelarPedidoConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Cancelar Pedido
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de conclusão -->
    <div
      v-if="pedidoParaConcluir"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100"
          >
            <i class="fas fa-check-circle text-green-600"></i>
          </div>
        </div>
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Concluir Pedido</h3>
          <p class="text-sm text-gray-500 mb-4">
            Tem certeza que deseja concluir o pedido
            <strong>{{ formatarId(pedidoParaConcluir.pedidoId) }}</strong
            >? O pedido será marcado como concluído.
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="pedidoParaConcluir = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            @click="concluirPedidoConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
          >
            Concluir Pedido
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de reativação -->
    <div
      v-if="pedidoParaReativar"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100"
          >
            <i class="fas fa-redo text-yellow-600"></i>
          </div>
        </div>
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Reativar Pedido</h3>
          <p class="text-sm text-gray-500 mb-4">
            Tem certeza que deseja reativar o pedido
            <strong>{{ formatarId(pedidoParaReativar.pedidoId) }}</strong
            >? O pedido voltará ao status ativo.
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="pedidoParaReativar = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            @click="reativarPedidoConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700"
          >
            Reativar Pedido
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de conversão de orçamento -->
    <div
      v-if="pedidoParaConverter"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100"
          >
            <i class="fas fa-exchange-alt text-purple-600"></i>
          </div>
        </div>
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
            Converter Orçamento em Pedido
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            Tem certeza que deseja converter o orçamento
            <strong>{{ formatarId(pedidoParaConverter.pedidoId) }}</strong> em pedido confirmado?
            <br />
            <span class="text-yellow-600 font-medium mt-2 block">
              ⚠️ Esta ação irá dar baixa no estoque!
            </span>
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="pedidoParaConverter = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="converterOrcamentoConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
          >
            <i class="fas fa-exchange-alt mr-2"></i>
            Converter em Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Pedidos.js"></script>
