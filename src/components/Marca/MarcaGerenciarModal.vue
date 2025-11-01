<template>
  <div
    v-if="modalAberto"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold">Gerenciar Marcas</h3>
        <button @click="fecharModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <div class="p-6">
        <!-- Formulário de nova marca -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-plus-circle text-purple-600 mr-1"></i>
            Nova Marca
          </label>
          <form @submit.prevent="adicionarMarca" class="flex gap-3">
            <input
              ref="inputNovaMarca"
              v-model="novaMarca"
              type="text"
              placeholder="Digite o nome da marca"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              :disabled="carregando"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <i v-if="carregando" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-plus mr-2"></i>
              Adicionar
            </button>
          </form>
        </div>

        <!-- Lista de marcas -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Marcas Cadastradas ({{ marcas.length }})
          </label>

          <div v-if="marcas.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="marca in marcas"
              :key="marca.id"
              class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div v-if="marcaEditando?.id === marca.id" class="flex-1 flex gap-2">
                <input
                  v-model="nomeEditando"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  @keyup.enter="salvarEdicao(marca)"
                  @keyup.esc="cancelarEdicao"
                  autofocus
                />
                <button
                  @click="salvarEdicao(marca)"
                  class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  title="Salvar (Enter)"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  @click="cancelarEdicao"
                  class="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  title="Cancelar (Esc)"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div v-else class="flex-1 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ marca.nome }}</span>
                <div class="flex gap-2">
                  <button
                    @click="editarMarca(marca)"
                    class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="excluirMarca(marca)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Excluir"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-gray-200"
          >
            <i class="fas fa-tags text-3xl mb-2"></i>
            <p class="text-sm">Nenhuma marca cadastrada</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            @click="fecharModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarcaStore } from '@/stores/marcaStore'
import Swal from 'sweetalert2'

export default {
  name: 'MarcaGerenciarModal',
  props: {
    modalAberto: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['fechar', 'atualizar'],
  setup(props, { emit }) {
    const marcaStore = useMarcaStore()
    const { marcas } = storeToRefs(marcaStore)

    const novaMarca = ref('')
    const marcaEditando = ref(null)
    const nomeEditando = ref('')
    const carregando = ref(false)
    const inputNovaMarca = ref(null)

    const carregarMarcas = async () => {
      try {
        await marcaStore.listarMarcas()
      } catch (error) {
        console.error('Erro ao carregar marcas:', error)
      }
    }

    // Carregar marcas quando o componente for montado
    onMounted(() => {
      carregarMarcas()
    })

    const adicionarMarca = async () => {
      if (!novaMarca.value.trim()) return

      carregando.value = true
      try {
        await marcaStore.criarMarca({ nome: novaMarca.value })
        novaMarca.value = ''
        emit('atualizar')
        await nextTick()
        inputNovaMarca.value?.focus()
      } catch (error) {
        console.error('Erro ao adicionar marca:', error)
      } finally {
        carregando.value = false
      }
    }

    const editarMarca = (marca) => {
      marcaEditando.value = marca
      nomeEditando.value = marca.nome
    }

    const salvarEdicao = async (marca) => {
      if (!nomeEditando.value.trim()) return

      try {
        await marcaStore.atualizarMarca(marca.id, { nome: nomeEditando.value })
        marcaEditando.value = null
        nomeEditando.value = ''
        emit('atualizar')
      } catch (error) {
        console.error('Erro ao atualizar marca:', error)
      }
    }

    const cancelarEdicao = () => {
      marcaEditando.value = null
      nomeEditando.value = ''
    }

    const excluirMarca = async (marca) => {
      const resultado = await Swal.fire({
        title: 'Confirmar Exclusão',
        html: `Tem certeza que deseja excluir a marca <strong>"${marca.nome}"</strong>?<br><br>Esta ação não pode ser desfeita.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      })

      if (!resultado.isConfirmed) return

      try {
        await marcaStore.excluirMarca(marca.id)
        emit('atualizar')
        await Swal.fire({
          title: 'Excluída!',
          text: 'A marca foi excluída com sucesso.',
          icon: 'success',
          confirmButtonColor: '#9333ea',
          timer: 2000,
        })
      } catch (error) {
        console.error('Erro ao excluir marca:', error)

        // Extrai a mensagem de erro da API
        let mensagemErro = 'Não foi possível excluir a marca.'

        if (error.response?.data?.errors) {
          // Backend retorna array de erros
          mensagemErro = error.response.data.errors.join('<br>')
        } else if (error.response?.data?.message) {
          // Backend retorna mensagem única
          mensagemErro = error.response.data.message
        } else if (error.response?.data) {
          // Tenta pegar qualquer mensagem do data
          mensagemErro =
            typeof error.response.data === 'string'
              ? error.response.data
              : JSON.stringify(error.response.data)
        } else if (error.message) {
          // Mensagem genérica do erro
          mensagemErro = error.message
        }

        await Swal.fire({
          title: 'Erro ao Excluir',
          html: mensagemErro,
          icon: 'error',
          confirmButtonColor: '#9333ea',
        })
      }
    }

    const fecharModal = () => {
      emit('fechar')
    }

    // Também carrega quando o modal abre
    watch(
      () => props.modalAberto,
      async (valor) => {
        if (valor) {
          await carregarMarcas()
          await nextTick()
          inputNovaMarca.value?.focus()
        }
      },
    )

    return {
      marcas,
      novaMarca,
      marcaEditando,
      nomeEditando,
      carregando,
      inputNovaMarca,
      adicionarMarca,
      editarMarca,
      salvarEdicao,
      cancelarEdicao,
      excluirMarca,
      fecharModal,
    }
  },
}
</script>
