<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Produtos</h1>
      <p class="text-gray-600">Gerencie o catálogo de produtos da sua empresa</p>
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
            placeholder="Digite o nome do produto..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="aplicarFiltros"
          />
        </div>

        <!-- Filtro por categoria -->
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <select
            v-model="filtroCategoria"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nome }}
            </option>
          </select>
        </div>

        <!-- Filtro por marca -->
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Marca</label>
          <select
            v-model="filtroMarca"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as marcas</option>
            <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
              {{ marca.nome }}
            </option>
          </select>
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
        </div>
      </div>

      <!-- Linha de ações rápidas com atalhos visíveis -->
      <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t">
        <button
          @click="abrirModal()"
          class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          <i class="fas fa-plus"></i>
          <span>Novo Produto</span>
          <kbd
            class="ml-2 px-2 py-0.5 bg-green-700 bg-opacity-50 border border-green-500 rounded text-xs font-mono"
          >
            Tab
          </kbd>
        </button>
        <button
          @click="abrirModalCategoria"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <i class="fas fa-folder"></i>
          <span>Gerenciar Categorias</span>
          <kbd
            class="ml-2 px-2 py-0.5 bg-blue-700 bg-opacity-50 border border-blue-500 rounded text-xs font-mono"
          >
            Alt+C
          </kbd>
        </button>
        <button
          @click="abrirModalMarca"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          <i class="fas fa-tags"></i>
          <span>Gerenciar Marcas</span>
          <kbd
            class="ml-2 px-2 py-0.5 bg-purple-700 bg-opacity-50 border border-purple-500 rounded text-xs font-mono"
          >
            Alt+M
          </kbd>
        </button>
      </div>
    </div>

    <!-- Tabela de produtos -->
    <div class="bg-white rounded-lg shadow">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        <span class="ml-2 text-gray-600">Carregando produtos...</span>
      </div>

      <!-- Tabela -->
      <div v-else-if="produtos.length > 0" class="overflow-x-auto">
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
                Categoria
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Marca
              </th>
              <th
                @click="alterarOrdenacao('preco')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Preço
                <i
                  v-if="ordenacao.campo === 'preco'"
                  :class="[
                    'fas',
                    'ml-1',
                    ordenacao.direcao === 'asc' ? 'fa-sort-up' : 'fa-sort-down',
                  ]"
                ></i>
              </th>
              <th
                @click="alterarOrdenacao('estoque')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Estoque
                <i
                  v-if="ordenacao.campo === 'estoque'"
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
                Unidade
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="produto in produtos" :key="produto.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ produto.nome }}</div>
                <div v-if="produto.descricao" class="text-sm text-gray-500 truncate max-w-xs">
                  {{ produto.descricao }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ obterNomeCategoria(produto.categoriaId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ obterNomeMarca(produto.marcaId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                R$ {{ formatarMoeda(produto.preco) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    produto.estoque > 10
                      ? 'bg-green-100 text-green-800'
                      : produto.estoque > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ produto.estoque }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ produto.unidadeMedida }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button
                    @click="editarProduto(produto)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Editar produto"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmarExclusao(produto)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Excluir produto"
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
        <i class="fas fa-box-open text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
        <p class="text-gray-500 mb-4">Comece criando seu primeiro produto</p>
        <button
          @click="abrirModal()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-plus mr-2"></i>
          Criar Produto
        </button>
      </div>

      <!-- Paginação -->
      <div
        v-if="produtos.length > 0 && totalPaginas > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="paginaAtual > 1 && (paginaAtual--, listarProdutos())"
            :disabled="paginaAtual === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            @click="paginaAtual < totalPaginas && (paginaAtual++, listarProdutos())"
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
                @click="paginaAtual > 1 && (paginaAtual--, listarProdutos())"
                :disabled="paginaAtual === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="pagina in gerarPaginas()"
                :key="pagina"
                @click="pagina !== '...' && ((paginaAtual = pagina), listarProdutos())"
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
                @click="paginaAtual < totalPaginas && (paginaAtual++, listarProdutos())"
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
      v-if="produtoParaExcluir"
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
            Tem certeza que deseja excluir o produto <strong>{{ produtoParaExcluir.nome }}</strong
            >? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            @click="produtoParaExcluir = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="excluirProdutoConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal do produto -->
    <ProdutoModal />

    <!-- Modal de Categorias -->
    <CategoriaModal
      v-if="modalCategoriaAberto"
      :modalAberto="modalCategoriaAberto"
      @fechar="fecharModalCategoria"
      @atualizar="recarregarCategorias"
    />

    <!-- Modal de Marcas -->
    <MarcaModal
      v-if="modalMarcaAberto"
      :modalAberto="modalMarcaAberto"
      @fechar="fecharModalMarca"
      @atualizar="recarregarMarcas"
    />
  </div>
</template>

<script src="./index.js"></script>
