<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <i class="fas fa-shopping-cart"></i>
          Novo Pedido
        </h1>
        <form @submit.prevent="salvarPedido" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 mb-1 font-medium" for="cliente">
                <i class="fas fa-user mr-1"></i> Cliente
              </label>
              <select
                v-model="cliente"
                id="cliente"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              >
                <option value="" disabled>Selecione o cliente</option>
                <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 font-medium" for="data">
                <i class="fas fa-calendar-alt mr-1"></i> Data do Pedido
              </label>
              <input
                v-model="data"
                id="data"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-gray-700 mb-1 font-medium" for="observacoes">
              <i class="fas fa-comment mr-1"></i> Observações
            </label>
            <textarea
              v-model="observacoes"
              id="observacoes"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Observações do pedido (opcional)"
            ></textarea>
          </div>
          <div>
            <label class="block text-gray-700 mb-1 font-medium" for="produtos">
              <i class="fas fa-boxes mr-1"></i> Produtos
            </label>
            <SeletorProduto
              :produtos="produtos"
              v-model="produtosSelecionados"
              @selecionados="atualizarItensSelecionados"
            />
            <div v-if="produtosSelecionados.length > 0" class="mt-4 space-y-2">
              <div
                v-for="(item, idx) in produtosSelecionados"
                :key="item.id"
                class="flex gap-2 items-center"
              >
                <span class="flex-1 font-medium">#{{ item.id }} - {{ item.nome }}</span>
                <input
                  v-model.number="item.quantidade"
                  type="number"
                  min="1"
                  class="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="Qtd"
                  required
                />
                <button
                  type="button"
                  @click="removerProdutoSelecionado(idx)"
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="text-lg font-semibold">
              <i class="fas fa-money-bill-wave mr-1"></i> Total:
              <span class="text-blue-700">{{ currency(totalPedido) }}</span>
            </div>
            <div class="flex gap-2">
              <button
                type="submit"
                class="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
              >
                <i class="fas fa-save"></i> Salvar Pedido
              </button>
              <button
                type="button"
                @click="limparFormulario"
                class="bg-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-lg shadow hover:bg-gray-300 transition flex items-center gap-2"
              >
                <i class="fas fa-eraser"></i> Limpar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./PedidoView.js"></script>
