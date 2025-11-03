<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Clientes</h1>
      <p class="text-gray-600">Gerencie os clientes da sua empresa</p>
    </div>

    <!-- Filtros e Ações -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            v-model="termoBusca"
            type="text"
            placeholder="Nome, CPF/CNPJ ou telefone..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="aplicarFiltros"
          />
        </div>

        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filtroAtivos"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">Todos</option>
            <option :value="true">Apenas Ativos</option>
            <option :value="false">Inativos</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="aplicarFiltros"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i class="fas fa-search mr-2"></i>Buscar
          </button>
          <button
            @click="limparFiltros"
            class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <i class="fas fa-times mr-2"></i>Limpar
          </button>
          <button
            @click="abrirModal()"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i class="fas fa-plus mr-2"></i>Novo
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded-lg shadow">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
        <span class="ml-2 text-gray-600">Carregando...</span>
      </div>

      <div v-else-if="clientes.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                @click="alterarOrdenacao('nome')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
              >
                Nome
                <i
                  v-if="ordenacao.campo === 'nome'"
                  :class="['fas ml-1', ordenacao.direcao === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"
                ></i>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CPF/CNPJ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contato
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cidade
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cli in clientes" :key="cli.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ cli.nome }}</div>
                <div v-if="cli.email" class="text-sm text-gray-500">{{ cli.email }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatarCpfCnpj(cli.cpfCnpj) }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ formatarTelefone(cli.telefone) }}</div>
                <div v-if="cli.celular" class="text-sm text-gray-500">
                  {{ formatarTelefone(cli.celular) }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ cli.cidade || '-' }}/{{ cli.estado || '' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    cli.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ cli.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                <div class="flex gap-2">
                  <button
                    @click="editarCliente(cli)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    v-if="cli.ativo"
                    @click="inativarCliente(cli.id)"
                    class="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-100"
                    title="Inativar"
                  >
                    <i class="fas fa-ban"></i>
                  </button>
                  <button
                    v-else
                    @click="ativarCliente(cli.id)"
                    class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                    title="Ativar"
                  >
                    <i class="fas fa-check-circle"></i>
                  </button>
                  <button
                    @click="confirmarExclusao(cli)"
                    class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                    title="Excluir"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center py-12">
        <i class="fas fa-users text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
        <button
          @click="abrirModal()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i class="fas fa-plus mr-2"></i>Criar Cliente
        </button>
      </div>

      <!-- Paginação -->
      <div
        v-if="clientes.length > 0 && totalPaginas > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t"
      >
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ (paginaAtual - 1) * itensPorPagina + 1 }}</span> até
            <span class="font-medium">{{
              Math.min(paginaAtual * itensPorPagina, totalItens)
            }}</span>
            de <span class="font-medium">{{ totalItens }}</span> resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="paginaAtual > 1 && (paginaAtual--, listarClientes())"
              :disabled="paginaAtual === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              @click="paginaAtual < totalPaginas && (paginaAtual++, listarClientes())"
              :disabled="paginaAtual === totalPaginas"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div
      v-if="clienteParaExcluir"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium mb-4">Confirmar Exclusão</h3>
        <p class="text-sm text-gray-500 mb-4">
          Tem certeza que deseja excluir <strong>{{ clienteParaExcluir.nome }}</strong
          >?
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="clienteParaExcluir = null"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="excluirConfirmado"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cliente -->
    <ClienteModal />
  </div>
</template>

<script src="./index.js"></script>
