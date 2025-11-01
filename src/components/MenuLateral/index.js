import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router/index.js'

export default {
  name: 'Menu Lateral',
  setup() {
    const userAuthStore = useAuthStore()

    const Sair = () => {
      closeMenu()
      userAuthStore.logout()
      // Redireciona para a tela de login
      router.push({ name: 'Login' })
    }

    // Estado para controlar se o menu está aberto ou fechado
    const isMenuOpen = ref(false)

    // Estado para controlar submenu de estoque
    const estoqueMenuAberto = ref(true) // Aberto por padrão

    // Função para alternar o estado do menu
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    }

    // Função para alternar submenu de estoque
    const toggleEstoqueMenu = () => {
      estoqueMenuAberto.value = !estoqueMenuAberto.value
    }

    // Função para fechar o menu
    const closeMenu = () => {
      isMenuOpen.value = false
    }

    return {
      isMenuOpen,
      estoqueMenuAberto,
      toggleMenu,
      toggleEstoqueMenu,
      closeMenu,
      Sair,
    }
  },
}
