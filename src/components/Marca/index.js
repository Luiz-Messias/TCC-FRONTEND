import { storeToRefs } from 'pinia'
import { useMarcaStore } from '@/stores/marcaStore'
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'MarcaModal',
  setup() {
    const marcaStore = useMarcaStore()
    const campoNome = ref(null)

    const { marca, modalAberto, modoEdicao, loading } = storeToRefs(marcaStore)

    const { fecharModal, criarMarca, atualizarMarca } = marcaStore

    const salvarMarca = async () => {
      try {
        if (modoEdicao.value) {
          await atualizarMarca(marca.value.id, marca.value)
        } else {
          marca.value.id = 0
          await criarMarca(marca.value)
        }
      } catch (erro) {
        // Erro já tratado na store
      }
    }

    // Foca no campo nome quando o modal abre
    watch(modalAberto, (novoValor) => {
      if (novoValor) {
        nextTick(() => {
          if (campoNome.value) {
            campoNome.value.focus()
          }
        })
      }
    })

    return {
      marca,
      modalAberto,
      modoEdicao,
      loading,
      campoNome,
      fecharModal,
      salvarMarca,
    }
  },
}
