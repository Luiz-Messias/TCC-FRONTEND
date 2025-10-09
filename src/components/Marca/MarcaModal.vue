<template>
  <div
    v-if="modalAberto"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold">
          {{ modoEdicao ? 'Editar Marca' : 'Nova Marca' }}
        </h3>
        <button @click="fecharModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="salvarMarca" class="p-6">
        <!-- Nome -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Nome da Marca * </label>
          <input
            ref="campoNome"
            v-model="marca.nome"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome da marca"
          />
        </div>

        <!-- Descrição -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Descrição da Marca </label>
          <textarea
            v-model="marca.descricao"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite a descrição da marca"
          ></textarea>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3">
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
