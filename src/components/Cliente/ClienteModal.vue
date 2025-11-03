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
          {{ modoEdicao ? 'Editar Cliente' : 'Novo Cliente' }}
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
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nome <span class="text-red-500">*</span>
              </label>
              <input
                v-model="cliente.nome"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ <span class="text-red-500">*</span>
              </label>
              <input
                v-model="cliente.cpfCnpj"
                type="text"
                required
                maxlength="18"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="aplicarMascaraCpfCnpj"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                E-mail <span class="text-red-500">*</span>
              </label>
              <input
                v-model="cliente.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Contato -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-700">Contato</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span class="text-red-500">*</span>
              </label>
              <input
                v-model="cliente.telefone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Celular</label>
              <input
                v-model="cliente.celular"
                type="tel"
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
                  v-model="cliente.cep"
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
                v-model="cliente.logradouro"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                v-model="cliente.numero"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                v-model="cliente.complemento"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                v-model="cliente.bairro"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                v-model="cliente.cidade"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              v-model="cliente.estado"
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
              v-model="cliente.ativo"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm font-medium text-gray-700">Cliente Ativo</span>
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
import { useClienteStore } from '@/stores/clienteStore'
import api from '@/api/axiosConfig'

export default {
  name: 'ClienteModal',
  setup() {
    const clienteStore = useClienteStore()
    const { cliente, modalAberto, modoEdicao, loading } = storeToRefs(clienteStore)
    const { criarCliente, atualizarCliente, fecharModal } = clienteStore

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

    const aplicarMascaraCpfCnpj = (event) => {
      let value = event.target.value.replace(/\D/g, '')
      
      if (value.length <= 11) {
        // CPF
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      } else {
        // CNPJ
        value = value.replace(/^(\d{2})(\d)/, '$1.$2')
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
        value = value.replace(/(\d{4})(\d)/, '$1-$2')
      }
      
      cliente.value.cpfCnpj = value
    }

    const buscarEnderecoPorCep = async () => {
      const cep = cliente.value.cep?.replace(/\D/g, '')
      if (cep && cep.length === 8) {
        try {
          const resposta = await api.get(`/viacep/${cep}`)
          const endereco = resposta.data.data || resposta.data
          
          if (endereco && !endereco.erro) {
            cliente.value.logradouro = endereco.logradouro || cliente.value.logradouro
            cliente.value.bairro = endereco.bairro || cliente.value.bairro
            cliente.value.cidade = endereco.localidade || cliente.value.cidade
            cliente.value.estado = endereco.uf || cliente.value.estado
          }
        } catch (erro) {
          console.error('Erro ao buscar CEP:', erro)
        }
      }
    }

    const salvar = async () => {
      if (modoEdicao.value) {
        await atualizarCliente(cliente.value.id, cliente.value)
      } else {
        await criarCliente(cliente.value)
      }
    }

    return {
      cliente,
      modalAberto,
      modoEdicao,
      loading,
      estados,
      fecharModal,
      salvar,
      aplicarMascaraCpfCnpj,
      buscarEnderecoPorCep,
    }
  },
}
</script>
