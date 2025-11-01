<template>
  <div
    v-if="modalAberto"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
    >
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">
          {{ modoEdicao ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
        </h2>
        <button @click="fecharModal" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">
          &times;
        </button>
      </div>

      <form @submit.prevent="salvar" class="p-6">
        <!-- Dados Principais -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-700">Dados Principais</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nome <span class="text-red-500">*</span>
              </label>
              <input
                v-model="fornecedor.nome"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
              <input
                v-model="fornecedor.razaoSocial"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                CNPJ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="fornecedor.cnpj"
                type="text"
                required
                maxlength="18"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="aplicarMascaraCnpj"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
              <input
                v-model="fornecedor.inscricaoEstadual"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Contato -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-700">Contato</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span class="text-red-500">*</span>
              </label>
              <input
                v-model="fornecedor.telefone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                v-model="fornecedor.celular"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                E-mail <span class="text-red-500">*</span>
              </label>
              <input
                v-model="fornecedor.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-700">Endereço</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <div class="flex gap-2">
                <input
                  v-model="fornecedor.cep"
                  type="text"
                  maxlength="9"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @blur="buscarEnderecoPorCep"
                />
                <button
                  type="button"
                  @click="buscarEnderecoPorCep"
                  class="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  title="Buscar CEP"
                >
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
              <input
                v-model="fornecedor.logradouro"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                v-model="fornecedor.numero"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                v-model="fornecedor.complemento"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                v-model="fornecedor.bairro"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                v-model="fornecedor.cidade"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="fornecedor.estado"
              class="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
            </select>
          </div>
        </div>

        <!-- Status -->
        <div class="mb-6">
          <label class="flex items-center">
            <input
              v-model="fornecedor.ativo"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm font-medium text-gray-700">Fornecedor Ativo</span>
          </label>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 justify-end border-t pt-4">
          <button
            type="button"
            @click="fecharModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ modoEdicao ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { storeToRefs } from 'pinia'
import { useFornecedorStore } from '@/stores/fornecedorStore'

export default {
  name: 'FornecedorModal',
  setup() {
    const fornecedorStore = useFornecedorStore()
    const { fornecedor, modalAberto, modoEdicao, loading } = storeToRefs(fornecedorStore)
    const { criarFornecedor, atualizarFornecedor, fecharModal, buscarCep } = fornecedorStore

    const estados = [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ]

    const aplicarMascaraCnpj = (event) => {
      let value = event.target.value.replace(/\D/g, '')
      if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2')
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
        value = value.replace(/(\d{4})(\d)/, '$1-$2')
        fornecedor.value.cnpj = value
      }
    }

    const buscarEnderecoPorCep = async () => {
      const cep = fornecedor.value.cep?.replace(/\D/g, '')
      if (cep && cep.length === 8) {
        const endereco = await buscarCep(cep)
        if (endereco) {
          fornecedor.value.logradouro = endereco.logradouro || fornecedor.value.logradouro
          fornecedor.value.bairro = endereco.bairro || fornecedor.value.bairro
          fornecedor.value.cidade = endereco.localidade || fornecedor.value.cidade
          fornecedor.value.estado = endereco.uf || fornecedor.value.estado
        }
      }
    }

    const salvar = async () => {
      if (modoEdicao.value) {
        await atualizarFornecedor(fornecedor.value.id, fornecedor.value)
      } else {
        await criarFornecedor(fornecedor.value)
      }
    }

    return {
      fornecedor,
      modalAberto,
      modoEdicao,
      loading,
      estados,
      fecharModal,
      salvar,
      aplicarMascaraCnpj,
      buscarEnderecoPorCep,
    }
  },
}
</script>
