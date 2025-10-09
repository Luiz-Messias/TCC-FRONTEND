<template>
  <div class="w-60 bg-white border-r-2 shadow-lg h-screen flex flex-col flex-shrink-0">
    <div class="flex justify-center cursor-pointer py-4">
      <router-link to="/home">
        <img
          src="@/assets/logo-preto-branco.png"
          alt="Logo Arcca Bebidas"
          class="w-[120px] h-[120px]"
        />
      </router-link>
    </div>
    <nav class="flex-1 overflow-y-auto">
      <ul class="space-y-1 px-3 pb-4">
        <li>
          <router-link
            to="/home"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-home mr-3 w-5"></i>
            Início
          </router-link>
        </li>
        <li>
          <router-link
            to="/produtos"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-box mr-3 w-5"></i>
            Produtos
          </router-link>
        </li>
        <li>
          <router-link
            to="/categorias"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-tags mr-3 w-5"></i>
            Categorias
          </router-link>
        </li>
        <li>
          <router-link
            to="/marcas"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-star mr-3 w-5"></i>
            Marcas
          </router-link>
        </li>
        <li>
          <router-link
            to="/clientes"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-users mr-3 w-5"></i>
            Clientes
          </router-link>
        </li>
        <li>
          <router-link
            to="/pedido/novo"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-shopping-cart mr-3 w-5"></i>
            Pedidos
          </router-link>
        </li>
        <li>
          <router-link
            to="/relatorios"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-chart-bar mr-3 w-5"></i>
            Relatórios
          </router-link>
        </li>
        <li>
          <router-link
            to="/devolucoes"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-undo mr-3 w-5"></i>
            Devoluções
          </router-link>
        </li>
        <li>
          <router-link
            to="/estoque"
            class="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-warehouse mr-3 w-5"></i>
            Estoque
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script src="./index.js"></script>

<style scoped>
.router-link-active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}

.router-link-active i {
  color: #1d4ed8;
}
</style>
