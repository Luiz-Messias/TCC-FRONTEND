<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Marcas</h1>
      <p class="text-gray-600">Gerencie as marcas dos produtos da sua empresa</p>
      <!-- Legenda do atalho -->
      <div class="mt-2 text-sm text-gray-500 flex items-center">
        <i class="fas fa-keyboard mr-1"></i>
        <span
          >Pressione
          <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono"
            >Tab</kbd
          >
          para criar nova marca rapidamente</span
        >
      </div>
    </div>

    <!-- Filtros e Ações -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <!-- Busca por nome -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Buscar por nome </label>
          <input
            v-model="termoBusca"
            type="text"
            placeholder="Digite o nome da marca..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="aplicarFiltros"
          />
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
            @click="abrirModal()"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <i class="fas fa-plus mr-2"></i>
            Nova Marca
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de marcas -->
    <div class="bg-white rounded-lg shadow">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        <span class="ml-2 text-gray-600">Carregando marcas...</span>
      </div>

      <!-- Tabela -->
      <div v-else-if="marcas.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                @click="alterarOrdenacao('nome')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Nome
                <i
                  v-if="ordenacao.campo === 'nome'"
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
                Descrição
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="marca in marcas" :key="marca.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ marca.nome }}</div>
              </td>
              <td class="px-6 py-4">
                <div v-if="marca.descricao" class="text-sm text-gray-500 max-w-xs">
                  {{ marca.descricao }}
                </div>
                <div v-else class="text-sm text-gray-400 italic">Sem descrição</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button
                    @click="editarMarca(marca)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Editar marca"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmarExclusao(marca)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Excluir marca"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado vazio -->
      <div v-else class="text-center py-12">
        <i class="fas fa-star text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma marca encontrada</h3>
        <p class="text-gray-500 mb-4">Comece criando sua primeira marca</p>
        <button
          @click="abrirModal()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-plus mr-2"></i>
          Criar Marca
        </button>
      </div>

      <!-- Paginação -->
      <div
        v-if="marcas.length > 0 && totalPaginas > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="paginaAtual > 1 && (paginaAtual--, listarMarcas())"
            :disabled="paginaAtual === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            @click="paginaAtual < totalPaginas && (paginaAtual++, listarMarcas())"
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
                @click="paginaAtual > 1 && (paginaAtual--, listarMarcas())"
                :disabled="paginaAtual === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="pagina in gerarPaginas()"
                :key="pagina"
                @click="pagina !== '...' && ((paginaAtual = pagina), listarMarcas())"
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
                @click="paginaAtual < totalPaginas && (paginaAtual++, listarMarcas())"
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

    <!-- Modal de confirmação de exclusão -->
    <div
      v-if="marcaParaExcluir"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
          >
            <i class="fas fa-exclamation-triangle text-red-600"></i>
          </div>
        </div>
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">Confirmar Exclusão</h3>
          <p class="text-sm text-gray-500 mb-4">
            Tem certeza que deseja excluir a marca <strong>{{ marcaParaExcluir.nome }}</strong
            >? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="marcaParaExcluir = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="excluirMarcaConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal da marca -->
    <MarcaModal />
  </div>
</template>

<script src="./index.js"></script>
