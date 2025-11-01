<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"
      >
        <h2 class="text-xl font-bold text-gray-800">
          <i class="fas fa-exchange-alt mr-2"></i>
          Nova Movimentação de Estoque
        </h2>
        <button @click="fechar" class="text-gray-400 hover:text-gray-600 transition-colors">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <form @submit.prevent="salvar" class="space-y-4">
          <!-- Tipo de Movimentação -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimentação <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="tipo in tiposMovimentacao"
                :key="tipo.value"
                type="button"
                @click="form.tipoMovimentacao = tipo.value"
                :class="[
                  'p-3 border-2 rounded-lg transition-all text-center',
                  form.tipoMovimentacao === tipo.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400',
                ]"
              >
                <i :class="['fas', tipo.icon, tipo.color, 'text-xl mb-1']"></i>
                <div class="text-sm font-medium">{{ tipo.label }}</div>
              </button>
            </div>
          </div>

          <!-- Produto -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Produto <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.produtoId"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                erros.produtoId ? 'border-red-500' : 'border-gray-300',
              ]"
            >
              <option :value="null">Selecione um produto</option>
              <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
                {{ produto.nome }}
              </option>
            </select>
            <p v-if="erros.produtoId" class="text-red-500 text-xs mt-1">{{ erros.produtoId }}</p>

            <!-- Info do Produto Selecionado -->
            <div v-if="produtoSelecionadoInfo" class="mt-2 p-3 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-600">Categoria:</span>
                  <span class="ml-2 font-medium">{{ produtoSelecionadoInfo.categoriaNome }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Saldo Atual:</span>
                  <span class="ml-2 font-bold text-blue-600">{{
                    produtoSelecionadoInfo.saldoAtual
                  }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Estoque Mínimo:</span>
                  <span class="ml-2">{{ produtoSelecionadoInfo.estoqueMinimo }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Estoque Máximo:</span>
                  <span class="ml-2">{{ produtoSelecionadoInfo.estoqueMaximo }}</span>
                </div>
              </div>

              <!-- Lotes Existentes (para saída) -->
              <div
                v-if="form.tipoMovimentacao === 'SAIDA' && produtoSelecionadoInfo.lotes?.length > 0"
                class="mt-3"
              >
                <label class="text-xs font-medium text-gray-600 block mb-2"
                  >Lotes Disponíveis:</label
                >
                <div class="space-y-1">
                  <button
                    v-for="lote in produtoSelecionadoInfo.lotes"
                    :key="lote.lote"
                    type="button"
                    @click="selecionarLote(lote)"
                    class="w-full text-left px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-xs"
                  >
                    <span class="font-medium">{{ lote.lote }}</span>
                    <span class="text-gray-600 mx-2">|</span>
                    <span>Qtd: {{ lote.quantidade }}</span>
                    <span class="text-gray-600 mx-2">|</span>
                    <span>Val: {{ new Date(lote.dataValidade).toLocaleDateString('pt-BR') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quantidade -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Quantidade <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.quantidade"
              type="number"
              min="1"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                erros.quantidade ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Digite a quantidade a movimentar"
            />
            <p v-if="erros.quantidade" class="text-red-500 text-xs mt-1">{{ erros.quantidade }}</p>
            <p
              v-else-if="produtoSelecionadoInfo && form.tipoMovimentacao === 'ENTRADA'"
              class="text-xs text-blue-600 mt-1"
            >
              💡 Digite a quantidade que está entrando no estoque
            </p>
            <p
              v-else-if="produtoSelecionadoInfo && form.tipoMovimentacao === 'SAIDA'"
              class="text-xs text-orange-600 mt-1"
            >
              ⚠️ Disponível: {{ produtoSelecionadoInfo.saldoAtual }} unidades
            </p>
          </div>

          <!-- Dados do Lote (obrigatório para ENTRADA) -->
          <div v-if="requererLote" class="border-t pt-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Informações do Lote</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Número do Lote -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Número do Lote <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.numeroLote"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    erros.numeroLote ? 'border-red-500' : 'border-gray-300',
                  ]"
                  placeholder="Ex: L001/2024"
                />
                <p v-if="erros.numeroLote" class="text-red-500 text-xs mt-1">
                  {{ erros.numeroLote }}
                </p>
              </div>

              <!-- Data de Fabricação -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fabricação <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.dataFabricacao"
                  type="date"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    erros.dataFabricacao ? 'border-red-500' : 'border-gray-300',
                  ]"
                />
                <p v-if="erros.dataFabricacao" class="text-red-500 text-xs mt-1">
                  {{ erros.dataFabricacao }}
                </p>
              </div>

              <!-- Data de Validade -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Data de Validade <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.dataValidade"
                  type="date"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    erros.dataValidade ? 'border-red-500' : 'border-gray-300',
                  ]"
                />
                <p v-if="erros.dataValidade" class="text-red-500 text-xs mt-1">
                  {{ erros.dataValidade }}
                </p>
              </div>
            </div>
          </div>

          <!-- Lote para SAIDA (opcional, mas pré-preenchido se selecionar) -->
          <div v-else-if="form.tipoMovimentacao === 'SAIDA'">
            <label class="block text-sm font-medium text-gray-700 mb-1"> Lote (opcional) </label>
            <input
              v-model="form.numeroLote"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Selecione um lote acima ou digite manualmente"
              readonly
            />
          </div>

          <!-- Observações -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Observações
              <span v-if="form.tipoMovimentacao === 'AJUSTE'" class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.observacoes"
              rows="3"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                erros.observacoes ? 'border-red-500' : 'border-gray-300',
              ]"
              :placeholder="
                form.tipoMovimentacao === 'AJUSTE'
                  ? 'Obrigatório: Explique o motivo do ajuste...'
                  : 'Informações adicionais sobre esta movimentação...'
              "
            ></textarea>
            <p v-if="erros.observacoes" class="text-red-500 text-xs mt-1">
              {{ erros.observacoes }}
            </p>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          @click="fechar"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="salvando"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="salvar"
          :disabled="salvando"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          <i v-if="salvando" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-save mr-2"></i>
          {{ salvando ? 'Salvando...' : 'Salvar Movimentação' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./MovimentacaoModal.js"></script>

<style scoped>
/* Animação suave para modal */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bg-white.rounded-lg {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
