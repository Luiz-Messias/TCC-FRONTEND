<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4"
  >
    <div
      class="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 flex flex-col items-center"
    >
      <img src="@/assets/logo-preto-branco.png" alt="Logo" class="w-32 mb-6 drop-shadow-lg" />

      <h2 class="text-2xl font-bold text-gray-700 mb-2 text-center">Bem-vindo!</h2>
      <p class="text-gray-500 text-center mb-6">Faça login para continuar</p>

      <form @submit.prevent="handleLogin" class="w-full space-y-5">
        <div>
          <label class="block text-gray-600 text-sm mb-1" for="email">E-mail</label>
          <input
            v-model="email"
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            required
            autocomplete="username"
          />
        </div>
        <div>
          <label class="block text-gray-600 text-sm mb-1" for="password">Senha</label>
          <input
            v-model="password"
            id="password"
            type="password"
            placeholder="Digite sua senha"
            class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            required
            autocomplete="current-password"
          />
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center text-gray-600 text-sm select-none">
            <input
              v-model="keepConnected"
              @change="onKeepConnectedChange"
              type="checkbox"
              class="accent-blue-500 mr-2 rounded"
            />
            Manter conectado
          </label>
          <a
            @click.prevent="mostrarMensagemSuporte"
            href="#"
            class="text-blue-500 text-sm hover:underline transition cursor-pointer"
          >
            Esqueceu a senha?
          </a>
        </div>
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold p-3 rounded-xl shadow hover:from-blue-600 hover:to-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  </div>
</template>

<script src="./index.js"></script>

<style scoped>
@media (max-width: 480px) {
  .max-w-md {
    max-width: 100% !important;
    padding: 1.5rem !important;
    border-radius: 1.25rem !important;
  }
  img {
    width: 6rem !important;
  }
}
</style>
