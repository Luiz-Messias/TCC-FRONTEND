<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Devoluções</h1>
      <p class="text-gray-600">Gerencie as devoluções de produtos dos clientes</p>
    </div>

    <!-- Modal de Devolução -->
    <DevolucaoModal />

    <!-- Filtros e Ações -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            v-model="termoBusca"
            type="text"
            placeholder="Cliente, pedido ou motivo..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="aplicarFiltros"
          />
        </div>

        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filtroStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="APROVADA">Aprovada</option>
            <option value="RECUSADA">Recusada</option>
            <option value="PROCESSADA">Processada</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="aplicarFiltros"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i class="fas fa-search mr-2"></i>Buscar
          </button>
          <button
            @click="limparFiltros"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <i class="fas fa-times mr-2"></i>Limpar
          </button>
          <button
            @click="abrirModal()"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i class="fas fa-plus mr-2"></i>Nova Devolução
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        <span class="ml-2 text-gray-600">Carregando...</span>
      </div>

      <div v-else-if="devolucoes.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th
                @click="alterarOrdenacao('dataDevolucao')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
              >
                Data
                <i
                  v-if="ordenacao.campo === 'dataDevolucao'"
                  :class="['fas ml-1', ordenacao.direcao === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"
                ></i>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pedido
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Motivo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="dev in devolucoes" :key="dev.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">#{{ dev.id }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatarData(dev.dataDevolucao) }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ dev.clienteNome || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ dev.pedidoId ? `#${dev.pedidoId.substring(0, 8)}...` : '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <div class="max-w-xs truncate" :title="formatarMotivo(dev.motivo)">
                  {{ formatarMotivo(dev.motivo) }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ formatarValor(dev.valorTotal) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    obterCorStatus(dev.status),
                  ]"
                >
                  <i :class="['fas', obterIconeStatus(dev.status), 'mr-1']"></i>
                  {{ converterStatus(dev.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                <div class="flex gap-2">
                  <button
                    v-if="dev.status === 'PENDENTE'"
                    @click="aprovarDevolucao(dev.id)"
                    class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                    title="Aprovar"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    v-if="dev.status === 'PENDENTE'"
                    @click="recusarDevolucao(dev.id)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Recusar"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                  <button
                    v-if="dev.status === 'APROVADA'"
                    @click="processarDevolucao(dev.id)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Processar"
                  >
                    <i class="fas fa-cog"></i>
                  </button>
                  <button
                    @click="editarDevolucao(dev)"
                    class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                    title="Ver Detalhes"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    v-if="dev.status === 'PENDENTE'"
                    @click="confirmarExclusao(dev)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Excluir"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-12">
        <i class="fas fa-undo text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma devolução encontrada</h3>
        <button
          @click="abrirModal()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-plus mr-2"></i>Registrar Devolução
        </button>
      </div>

      <!-- Paginação -->
      <div
        v-if="devolucoes.length > 0 && totalPaginas > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t"
      >
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ (paginaAtual - 1) * itensPorPagina + 1 }}</span> até
            <span class="font-medium">{{
              Math.min(paginaAtual * itensPorPagina, totalItens)
            }}</span>
            de <span class="font-medium">{{ totalItens }}</span> resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="paginaAtual > 1 && (paginaAtual--, listarDevolucoes())"
              :disabled="paginaAtual === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              @click="paginaAtual < totalPaginas && (paginaAtual++, listarDevolucoes())"
              :disabled="paginaAtual === totalPaginas"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./index.js"></script>
