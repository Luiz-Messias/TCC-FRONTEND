<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Conversor de Unidades</h1>
      <p class="text-gray-600">
        Converta quantidades entre diferentes unidades de medida (massa, volume, comprimento, etc.)
      </p>
    </div>

    <!-- Cartão de Conversão -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulário de Conversão -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Converter Unidades</h2>

        <div class="space-y-4">
          <!-- Quantidade Origem -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Origem
            </label>
            <input
              v-model.number="quantidadeOrigem"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a quantidade"
              @input="limparResultado"
            />
          </div>

          <!-- Unidade Origem -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Unidade de Origem </label>
            <select
              v-model="unidadeOrigem"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="limparResultado"
            >
              <option value="">Selecione uma unidade</option>
              <optgroup
                v-for="(unidades, categoria) in todasUnidades"
                :key="categoria"
                :label="categoria"
              >
                <option v-for="unidade in unidades" :key="unidade" :value="unidade">
                  {{ unidade }} - {{ obterDescricaoUnidade(unidade) }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Unidade Destino -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Unidade de Destino </label>
            <select
              v-model="unidadeDestino"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="limparResultado"
            >
              <option value="">Selecione uma unidade</option>
              <optgroup
                v-for="(unidades, categoria) in todasUnidades"
                :key="categoria"
                :label="categoria"
              >
                <option v-for="unidade in unidades" :key="unidade" :value="unidade">
                  {{ unidade }} - {{ obterDescricaoUnidade(unidade) }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Fator Customizado (Opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fator de Conversão Customizado (opcional)
            </label>
            <input
              v-model.number="fatorCustomizado"
              type="number"
              step="0.0001"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 2.5 (deixe em branco para usar fator padrão)"
              @input="limparResultado"
            />
            <p class="text-xs text-gray-500 mt-1">
              Use isso para produtos com embalagens especiais
            </p>
          </div>

          <!-- Botão Converter -->
          <button
            @click="converter"
            :disabled="!podeConverter"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <i class="fas fa-exchange-alt mr-2"></i>
            Converter
          </button>
        </div>
      </div>

      <!-- Resultado da Conversão -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Resultado</h2>

        <div v-if="!resultado" class="text-center py-12">
          <i class="fas fa-calculator text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Preencha os campos e clique em "Converter"</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Visualização da Conversão -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-center flex-1">
                <div class="text-3xl font-bold text-blue-900">
                  {{ formatarNumero(resultado.quantidadeOrigem) }}
                </div>
                <div class="text-sm text-blue-600 mt-1">
                  {{ resultado.unidadeOrigem }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ obterDescricaoUnidade(resultado.unidadeOrigem) }}
                </div>
              </div>

              <div class="px-4">
                <i class="fas fa-arrow-right text-2xl text-blue-500"></i>
              </div>

              <div class="text-center flex-1">
                <div class="text-3xl font-bold text-green-900">
                  {{ formatarNumero(resultado.quantidadeDestino) }}
                </div>
                <div class="text-sm text-green-600 mt-1">
                  {{ resultado.unidadeDestino }}
                </div>
                <div class="text-xs text-gray-600">
                  {{ obterDescricaoUnidade(resultado.unidadeDestino) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Informações da Conversão -->
          <div class="space-y-2">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Fator de Conversão:</span>
              <span class="font-semibold">{{ formatarNumero(resultado.fatorConversao) }}</span>
            </div>

            <div class="bg-green-50 border border-green-200 rounded p-3">
              <p class="text-sm text-green-800">
                <i class="fas fa-check-circle mr-2"></i>
                {{ resultado.mensagem }}
              </p>
            </div>

            <!-- Fórmula -->
            <div class="bg-gray-50 border border-gray-200 rounded p-3">
              <p class="text-xs text-gray-600 font-mono">
                {{ formatarNumero(resultado.quantidadeOrigem) }} {{ resultado.unidadeOrigem }} ×
                {{ formatarNumero(resultado.fatorConversao) }} =
                {{ formatarNumero(resultado.quantidadeDestino) }} {{ resultado.unidadeDestino }}
              </p>
            </div>

            <!-- Botões de Ação -->
            <div class="flex gap-2 mt-4">
              <button
                @click="inverterConversao"
                class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <i class="fas fa-sync-alt mr-2"></i>
                Inverter
              </button>
              <button
                @click="limparTudo"
                class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <i class="fas fa-eraser mr-2"></i>
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Referência Rápida -->
    <div class="mt-6 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        <i class="fas fa-table mr-2 text-gray-600"></i>
        Tabela de Referência Rápida
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Massa -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="fas fa-weight text-blue-600 mr-2"></i>
            Massa
          </h3>
          <ul class="text-sm space-y-1 text-gray-600">
            <li>1 KG = 1.000 G</li>
            <li>1 G = 1.000 MG</li>
            <li>1 TON = 1.000 KG</li>
          </ul>
        </div>

        <!-- Volume -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="fas fa-flask text-green-600 mr-2"></i>
            Volume
          </h3>
          <ul class="text-sm space-y-1 text-gray-600">
            <li>1 L = 1.000 ML</li>
            <li>1 M³ = 1.000 L</li>
          </ul>
        </div>

        <!-- Comprimento -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="fas fa-ruler text-purple-600 mr-2"></i>
            Comprimento
          </h3>
          <ul class="text-sm space-y-1 text-gray-600">
            <li>1 M = 100 CM</li>
            <li>1 CM = 10 MM</li>
            <li>1 KM = 1.000 M</li>
          </ul>
        </div>

        <!-- Unidades -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="fas fa-boxes text-orange-600 mr-2"></i>
            Unidades
          </h3>
          <ul class="text-sm space-y-1 text-gray-600">
            <li>1 DZ = 12 UN</li>
            <li>1 CX = 12 UN</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axiosConfig'
import { toast } from 'vue3-toastify'

export default {
  name: 'ConversaoUnidadesView',
  setup() {
    const quantidadeOrigem = ref(null)
    const unidadeOrigem = ref('')
    const unidadeDestino = ref('')
    const fatorCustomizado = ref(null)
    const resultado = ref(null)
    const todasUnidades = ref({})

    const podeConverter = computed(() => {
      return (
        quantidadeOrigem.value !== null &&
        quantidadeOrigem.value > 0 &&
        unidadeOrigem.value &&
        unidadeDestino.value
      )
    })

    const carregarUnidades = async () => {
      try {
        const response = await api.get('/ConversaoUnidades/unidades')
        todasUnidades.value = response.data.data || {}
      } catch (error) {
        console.error('Erro ao carregar unidades:', error)
        toast.error('Erro ao carregar lista de unidades')
      }
    }

    const converter = async () => {
      if (!podeConverter.value) return

      try {
        const params = {
          quantidade: quantidadeOrigem.value,
          unidadeOrigem: unidadeOrigem.value,
          unidadeDestino: unidadeDestino.value,
        }

        if (fatorCustomizado.value !== null && fatorCustomizado.value > 0) {
          params.fatorCustomizado = fatorCustomizado.value
        }

        const response = await api.get('/ConversaoUnidades/converter', { params })
        resultado.value = response.data.data

        toast.success('Conversão realizada com sucesso!')
      } catch (error) {
        const mensagem = error.response?.data?.message || 'Erro ao converter unidades'
        toast.error(mensagem)
        resultado.value = null
      }
    }

    const limparResultado = () => {
      resultado.value = null
    }

    const limparTudo = () => {
      quantidadeOrigem.value = null
      unidadeOrigem.value = ''
      unidadeDestino.value = ''
      fatorCustomizado.value = null
      resultado.value = null
    }

    const inverterConversao = () => {
      if (!resultado.value) return

      quantidadeOrigem.value = resultado.value.quantidadeDestino
      const temp = unidadeOrigem.value
      unidadeOrigem.value = unidadeDestino.value
      unidadeDestino.value = temp
      resultado.value = null
    }

    const formatarNumero = (valor) => {
      if (valor === null || valor === undefined) return '0'
      return Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      })
    }

    const obterDescricaoUnidade = (sigla) => {
      const descricoes = {
        MG: 'Miligrama',
        G: 'Grama',
        KG: 'Quilograma',
        TON: 'Tonelada',
        ML: 'Mililitro',
        L: 'Litro',
        M3: 'Metro Cúbico',
        MM: 'Milímetro',
        CM: 'Centímetro',
        M: 'Metro',
        KM: 'Quilômetro',
        UN: 'Unidade',
        DZ: 'Dúzia',
        CX: 'Caixa',
        PCT: 'Pacote',
        FD: 'Fardo',
        SC: 'Saco',
      }
      return descricoes[sigla] || sigla
    }

    onMounted(() => {
      carregarUnidades()
    })

    return {
      quantidadeOrigem,
      unidadeOrigem,
      unidadeDestino,
      fatorCustomizado,
      resultado,
      todasUnidades,
      podeConverter,
      converter,
      limparResultado,
      limparTudo,
      inverterConversao,
      formatarNumero,
      obterDescricaoUnidade,
    }
  },
}
</script>
