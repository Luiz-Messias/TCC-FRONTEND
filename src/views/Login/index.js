import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

export default {
  name: 'Login',
  setup() {
    const email = ref(localStorage.getItem('keepConnectedEmail') || '')
    const password = ref(localStorage.getItem('keepConnectedPassword') || '')
    const keepConnected = ref(
      localStorage.getItem('keepConnected') === 'true' &&
        !!localStorage.getItem('keepConnectedEmail') &&
        !!localStorage.getItem('keepConnectedPassword'),
    )
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogin = async () => {
      if (keepConnected.value) {
        localStorage.setItem('keepConnected', 'true')
        localStorage.setItem('keepConnectedEmail', email.value)
        localStorage.setItem('keepConnectedPassword', password.value)
      } else {
        localStorage.removeItem('keepConnected')
        localStorage.removeItem('keepConnectedEmail')
        localStorage.removeItem('keepConnectedPassword')
      }

      const success = await authStore.login({
        email: email.value,
        password: password.value,
        manterConectado: keepConnected.value,
      })

      if (success) {
        router.push('/home')
      }
    }

    // Limpa email/senha salvos ao desmarcar keepConnected
    const onKeepConnectedChange = () => {
      if (!keepConnected.value) {
        localStorage.removeItem('keepConnected')
        localStorage.removeItem('keepConnectedEmail')
        localStorage.removeItem('keepConnectedPassword')
        email.value = ''
        password.value = ''
      }
    }

    // Mostra mensagem de suporte ao clicar em "Esqueceu a senha?"
    const mostrarMensagemSuporte = () => {
      Swal.fire({
        icon: 'info',
        title: 'Recuperação de Senha',
        html: '<p style="font-size: 16px; color: #4b5563;">Para redefinir sua senha, entre em contato com o <strong>administrador do sistema</strong> ou com o <strong>suporte técnico</strong>.</p>',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          title: 'text-xl font-semibold',
          confirmButton: 'px-6 py-2 rounded-lg',
        },
      })
    }

    return {
      email,
      password,
      keepConnected,
      handleLogin,
      onKeepConnectedChange,
      mostrarMensagemSuporte,
    }
  },
}
