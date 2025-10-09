<template>
  <div class="w-full max-w-xl">
    <label class="block text-sm font-medium text-gray-700 mb-1"> Buscar Produto </label>
    <div class="relative">
      <input
        v-model="busca"
        @input="filtrarProdutos"
        type="text"
        placeholder="Digite o nome ou ID do produto..."
        class="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
    </div>
    <div
      v-if="produtosFiltrados.length > 0"
      class="mt-2 border rounded bg-white max-h-60 overflow-y-auto shadow"
    >
      <ul>
        <li
          v-for="produto in produtosFiltrados"
          :key="produto.id"
          @click="selecionarProduto(produto)"
          class="px-4 py-2 cursor-pointer hover:bg-primary hover:bg-gray-300 flex justify-between items-center"
        >
          <div class="flex flex-col">
            <span>
              <span class="font-semibold">#{{ produto.id }}</span> - {{ produto.nome }}
            </span>
            <span class="text-sm text-gray-500">
              R$ {{ produto.preco?.toFixed(2).replace('.', ',') || '0,00' }}
            </span>
          </div>
          <i
            v-if="produtoSelecionadoIds.includes(produto.id)"
            class="fas fa-check text-green-500"
          ></i>
        </li>
      </ul>
    </div>
    <div v-else class="mt-3">
      <span class="font-semibold">Produto não encontrado</span>
    </div>
    <div v-if="produtosSelecionados.length > 0" class="mt-3">
      <div class="text-xs text-gray-500 mb-1">Produtos Selecionados:</div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="produto in produtosSelecionados"
          :key="produto.id"
          class="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center text-xs"
        >
          #{{ produto.id }} - {{ produto.nome }}
          <button @click.stop="removerProduto(produto)" class="ml-2 focus:outline-none">
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script src="./SeletorProduto.js"></script>
