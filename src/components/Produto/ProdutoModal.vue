<template>
  <div
    v-if="modalAberto"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold">
          {{ modoEdicao ? 'Editar Produto' : 'Novo Produto' }}
        </h3>
        <button @click="fecharModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="salvarProduto" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nome -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2"> Nome do Produto * </label>
            <input
              ref="nomeInput"
              v-model="produto.nome"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome do produto"
            />
          </div>

          <!-- Descrição -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2"> Descrição </label>
            <textarea
              v-model="produto.descricao"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a descrição do produto"
            ></textarea>
          </div>

          <!-- Preço -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Preço de Venda (R$) *
            </label>
            <input
              v-model.number="produto.preco"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Estoque -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantidade em Estoque *
            </label>
            <input
              v-model.number="produto.estoque"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Unidade de Medida -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Unidade de Medida *
            </label>
            <select
              v-model="produto.unidadeMedida"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unidade">Unidade</option>
              <option value="Caixa">Caixa</option>
              <option value="Litro">Litro</option>
            </select>
          </div>

          <!-- Fator de Conversão -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Fator de Conversão </label>
            <input
              v-model.number="produto.fatorConversao"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0"
            />
          </div>

          <!-- ICMS -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> ICMS (%) </label>
            <input
              v-model.number="produto.icms"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- IPI -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> IPI (%) </label>
            <input
              v-model.number="produto.ipi"
              type="number"
              step="0.01"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Categoria -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Categoria </label>
            <select
              v-model="produto.categoriaId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                {{ categoria.nome }}
              </option>
            </select>
          </div>

          <!-- Marca -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Marca </label>
            <select
              v-model="produto.marcaId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma marca</option>
              <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                {{ marca.nome }}
              </option>
            </select>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            type="button"
            @click="fecharModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ modoEdicao ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script src="./index.js"></script>
