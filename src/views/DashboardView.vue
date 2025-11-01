<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Bem-vindo ao Arcca Bebidas</h1>

    <!-- Grid de Ações -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Realizar Pedido -->
      <router-link to="/pedido/novo">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-plus-circle text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Novo</h3>
              <p class="text-sm text-gray-600">Pedido</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Ver Pedidos -->
      <router-link to="/pedidos">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-shopping-cart text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Ver</h3>
              <p class="text-sm text-gray-600">Pedidos</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Devolução de Produtos -->
      <router-link to="/devolucoes">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-undo text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Devolução</h3>
              <p class="text-sm text-gray-600">de Produtos</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Converter Unidades -->
      <router-link to="/conversao">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-exchange-alt text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Converter</h3>
              <p class="text-sm text-gray-600">Unidades</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Cancelar Pedido -->
      <router-link to="/pedido/cancelar">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-times text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Cancelar</h3>
              <p class="text-sm text-gray-600">Pedido</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Atualizar Preço -->
      <router-link to="/preco/atualizar">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-dollar-sign text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Atualizar</h3>
              <p class="text-sm text-gray-600">Preço</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- Calcular Impostos -->
      <router-link to="/impostos/calcular">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-calculator text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Calcular</h3>
              <p class="text-sm text-gray-600">Impostos</p>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script src="./DashboardView.js"></script>
