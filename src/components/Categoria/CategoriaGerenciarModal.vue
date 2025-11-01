<template>
  <div
    v-if="modalAberto"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold">Gerenciar Categorias</h3>
        <button @click="fecharModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Form -->
      <div class="p-6">
        <!-- Formulário de nova categoria -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-plus-circle text-blue-600 mr-1"></i>
            Nova Categoria
          </label>
          <form @submit.prevent="adicionarCategoria" class="flex gap-3">
            <input
              ref="inputNovaCategoria"
              v-model="novaCategoria"
              type="text"
              placeholder="Digite o nome da categoria"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              :disabled="carregando"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <i v-if="carregando" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-plus mr-2"></i>
              Adicionar
            </button>
          </form>
        </div>

        <!-- Lista de categorias -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Categorias Cadastradas ({{ categorias.length }})
          </label>

          <div v-if="categorias.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="categoria in categorias"
              :key="categoria.id"
              class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div v-if="categoriaEditando?.id === categoria.id" class="flex-1 flex gap-2">
                <input
                  v-model="nomeEditando"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="salvarEdicao(categoria)"
                  @keyup.esc="cancelarEdicao"
                  autofocus
                />
                <button
                  @click="salvarEdicao(categoria)"
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
                <span class="text-sm font-medium text-gray-900">{{ categoria.nome }}</span>
                <div class="flex gap-2">
                  <button
                    @click="editarCategoria(categoria)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="excluirCategoria(categoria)"
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
            <i class="fas fa-folder-open text-3xl mb-2"></i>
            <p class="text-sm">Nenhuma categoria cadastrada</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            @click="fecharModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
import { useCategoriaStore } from '@/stores/categoriaStore'
import Swal from 'sweetalert2'

export default {
  name: 'CategoriaGerenciarModal',
  props: {
    modalAberto: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['fechar', 'atualizar'],
  setup(props, { emit }) {
    const categoriaStore = useCategoriaStore()
    const { categorias } = storeToRefs(categoriaStore)

    const novaCategoria = ref('')
    const categoriaEditando = ref(null)
    const nomeEditando = ref('')
    const carregando = ref(false)
    const inputNovaCategoria = ref(null)

    const carregarCategorias = async () => {
      try {
        await categoriaStore.listarCategorias()
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }

    const adicionarCategoria = async () => {
      if (!novaCategoria.value.trim()) return

      carregando.value = true
      try {
        await categoriaStore.criarCategoria({ nome: novaCategoria.value })
        novaCategoria.value = ''
        emit('atualizar')
        await nextTick()
        inputNovaCategoria.value?.focus()
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error)
      } finally {
        carregando.value = false
      }
    }

    const editarCategoria = (categoria) => {
      categoriaEditando.value = categoria
      nomeEditando.value = categoria.nome
    }

    const salvarEdicao = async (categoria) => {
      if (!nomeEditando.value.trim()) return

      try {
        await categoriaStore.atualizarCategoria(categoria.id, { nome: nomeEditando.value })
        categoriaEditando.value = null
        nomeEditando.value = ''
        emit('atualizar')
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error)
      }
    }

    const cancelarEdicao = () => {
      categoriaEditando.value = null
      nomeEditando.value = ''
    }

    const excluirCategoria = async (categoria) => {
      const resultado = await Swal.fire({
        title: 'Confirmar Exclusão',
        html: `Tem certeza que deseja excluir a categoria <strong>"${categoria.nome}"</strong>?<br><br>Esta ação não pode ser desfeita.`,
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
        await categoriaStore.excluirCategoria(categoria.id)
        emit('atualizar')
        await Swal.fire({
          title: 'Excluída!',
          text: 'A categoria foi excluída com sucesso.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
        })
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)

        // Extrai a mensagem de erro da API
        let mensagemErro = 'Não foi possível excluir a categoria.'

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
          confirmButtonColor: '#3b82f6',
        })
      }
    }

    const fecharModal = () => {
      emit('fechar')
    }

    // Carregar categorias ao montar o componente
    onMounted(() => {
      carregarCategorias()
    })

    // Também carrega quando o modal abre
    watch(
      () => props.modalAberto,
      async (valor) => {
        if (valor) {
          await carregarCategorias()
          await nextTick()
          inputNovaCategoria.value?.focus()
        }
      },
    )

    return {
      categorias,
      novaCategoria,
      categoriaEditando,
      nomeEditando,
      carregando,
      inputNovaCategoria,
      adicionarCategoria,
      editarCategoria,
      salvarEdicao,
      cancelarEdicao,
      excluirCategoria,
      fecharModal,
    }
  },
}
</script>
