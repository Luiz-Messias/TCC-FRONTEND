<template>
  <div id="app" class="h-screen flex bg-gray-50 overflow-hidden">
    <MenuLateral v-if="estaAutenticado" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import { useRoute } from 'vue-router'
import MenuLateral from './components/MenuLateral/MenuLateral.vue'

export default {
  name: 'App',
  components: { MenuLateral },
  setup() {
    const authStore = useAuthStore()
    const route = useRoute()

    const estaAutenticado = computed(() => {
      // Não exibe o menu lateral nas rotas de login, splash e manual
      return (
        authStore.estaAutenticado &&
        route.path !== '/login' &&
        route.path !== '/' &&
        route.path !== '/manual'
      )
    })

    return {
      estaAutenticado,
    }
  },
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}

html {
  height: 100%;
  overflow: hidden;
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar personalizada para o conteúdo */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
