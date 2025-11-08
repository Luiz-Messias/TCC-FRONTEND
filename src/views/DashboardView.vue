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

      <!-- ✅ CORRIGIDO: Rota para conversão de unidades -->
      <router-link to="/conversao-unidades">
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

      <!-- ✅ CORRIGIDO: Dashboard de Estoque -->
      <router-link to="/estoque/dashboard">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-warehouse text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Dashboard</h3>
              <p class="text-sm text-gray-600">Estoque</p>
            </div>
          </div>
        </div>
      </router-link>

      <!-- ✅ CORRIGIDO: Relatórios -->
      <router-link to="/relatorios">
        <div
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <i class="fas fa-chart-bar text-indigo-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">Ver</h3>
              <p class="text-sm text-gray-600">Relatórios</p>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script src="./DashboardView.js"></script>
