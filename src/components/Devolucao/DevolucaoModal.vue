<template>
  <teleport to="body">
    <div
      v-if="modalAberto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="fecharModal"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ modoEdicao ? 'Detalhes da Devolução' : 'Nova Devolução' }}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              {{
                modoEdicao
                  ? 'Visualize os detalhes da devolução'
                  : 'Registre uma nova devolução de produtos'
              }}
            </p>
          </div>
          <button @click="fecharModal" class="text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Conteúdo -->
        <form @submit.prevent="salvar" class="p-6">
          <!-- Informações Básicas -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-info-circle text-blue-600 mr-2"></i>
              Informações Básicas
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Pedido -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pedido <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formulario.pedidoId"
                  @change="carregarPedido"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  :disabled="modoEdicao"
                >
                  <option value="">Selecione um pedido</option>
                  <option v-if="pedidos.length === 0" disabled>Carregando pedidos...</option>
                  <option v-for="pedido in pedidos" :key="pedido.id" :value="pedido.id">
                    #{{ pedido.id }} -
                    {{ pedido.clienteNome || pedido.cliente?.nome || 'Cliente não informado' }} - R$
                    {{ (pedido.valorTotal || 0).toFixed(2) }}
                  </option>
                </select>
              </div>

              <!-- Data da Devolução -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Data da Devolução <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formulario.dataDevolucao"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  :max="dataHoje"
                  :disabled="modoEdicao && formulario.status !== 'PENDENTE'"
                />
              </div>

              <!-- Cliente -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <input
                  v-model="formulario.clienteNome"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  readonly
                />
              </div>

              <!-- Status -->
              <div v-if="modoEdicao">
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div class="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      obterCorStatus(formulario.status),
                    ]"
                  >
                    <i :class="['fas', obterIconeStatus(formulario.status), 'mr-1']"></i>
                    {{ formulario.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Motivo -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Devolução <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formulario.motivo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              :disabled="modoEdicao && formulario.status !== 'PENDENTE'"
            >
              <option value="">Selecione um motivo</option>
              <option value="PRODUTO_DANIFICADO">Produto Danificado</option>
              <option value="PRODUTO_VENCIDO">Produto Vencido</option>
              <option value="PRODUTO_ERRADO">Produto Errado</option>
              <option value="NAO_CONFORME">Não Conforme</option>
              <option value="DESISTENCIA">Desistência do Cliente</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <!-- Observações -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2"> Observações </label>
            <textarea
              v-model="formulario.observacoes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva detalhes adicionais sobre a devolução..."
              :disabled="modoEdicao && formulario.status !== 'PENDENTE'"
            ></textarea>
          </div>

          <!-- Itens do Pedido -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="fas fa-box text-blue-600 mr-2"></i>
              Itens para Devolução
            </h3>

            <div
              v-if="formulario.itens.length === 0"
              class="text-center py-8 bg-gray-50 rounded-md"
            >
              <i class="fas fa-box-open text-4xl text-gray-300 mb-2"></i>
              <p class="text-gray-500">Selecione um pedido para ver os itens disponíveis</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="item in formulario.itens"
                :key="item.id"
                class="flex items-center gap-4 p-4 bg-gray-50 rounded-md border hover:bg-gray-100 transition"
              >
                <input
                  v-model="item.selecionado"
                  type="checkbox"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  :disabled="modoEdicao"
                />

                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ item.produtoNome }}</p>
                  <p class="text-sm text-gray-600">
                    Código: {{ item.produtoCodigo }} | Unidade: {{ item.unidade }}
                  </p>
                </div>

                <div class="text-right">
                  <p class="text-sm text-gray-600">Quantidade Pedida</p>
                  <p class="font-semibold text-gray-900">{{ item.quantidade }}</p>
                </div>

                <div class="w-32">
                  <label class="block text-xs text-gray-600 mb-1">Qtd. a Devolver</label>
                  <input
                    v-model.number="item.quantidadeDevolver"
                    type="number"
                    min="0"
                    :max="item.quantidade"
                    class="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="!item.selecionado || modoEdicao"
                  />
                </div>

                <div class="text-right w-32">
                  <p class="text-sm text-gray-600">Valor Unit.</p>
                  <p class="font-semibold text-gray-900">
                    R$ {{ (item.precoUnitario || 0).toFixed(2) }}
                  </p>
                </div>

                <div class="text-right w-32">
                  <p class="text-sm text-gray-600">Subtotal</p>
                  <p class="font-semibold text-blue-600">
                    R$ {{ ((item.quantidadeDevolver || 0) * (item.precoUnitario || 0)).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumo -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-600">Itens Selecionados</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formulario.itens.filter((i) => i.selecionado).length }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Valor Total da Devolução</p>
                <p class="text-2xl font-bold text-blue-600">
                  R$ {{ valorTotalDevolucao.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Botões -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="fecharModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {{ modoEdicao ? 'Fechar' : 'Cancelar' }}
            </button>
            <button
              v-if="!modoEdicao || formulario.status === 'PENDENTE'"
              type="submit"
              :disabled="loading || formulario.itens.filter((i) => i.selecionado).length === 0"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-save mr-2"></i>
              {{ modoEdicao ? 'Atualizar Devolução' : 'Registrar Devolução' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script src="./index.js"></script>

<style scoped>
/* Customização do scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
