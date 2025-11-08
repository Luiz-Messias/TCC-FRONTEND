import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import SplashScreen from '@/components/SplashScreen.vue'
import Login from '@/views/Login/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import PedidoView from '@/views/Pedido/PedidoView.vue'
import PedidosView from '@/views/Pedidos/Pedidos.vue'
import ProdutoView from '@/views/Produto/ProdutoView.vue'
import CategoriaView from '@/views/Categoria/CategoriaView.vue'
import MarcaView from '@/views/Marca/MarcaView.vue'
import EstoqueView from '@/views/Estoque/Estoque.vue'
import EstoqueSaldosView from '@/views/EstoqueSaldos/EstoqueSaldos.vue'
import EstoqueDashboardView from '@/views/EstoqueDashboard/EstoqueDashboard.vue'
import FornecedorView from '@/views/Fornecedor/FornecedorView.vue'
import ConversaoUnidadesView from '@/views/ConversaoUnidades/ConversaoUnidadesView.vue'
import ClienteView from '@/views/Cliente/ClienteView.vue'
import RelatoriosView from '@/views/Relatorios/RelatoriosView.vue'
import DevolucoesView from '@/views/Devolucoes/DevolucoesView.vue'
import ManualUsuarioView from '@/views/ManualUsuario/ManualUsuario.vue'

const routes = [
  {
    path: '/',
    name: 'SplashScreen',
    component: SplashScreen,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/home',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/pedido/novo',
    name: 'NovoPedido',
    component: PedidoView,
    meta: { requiresAuth: true },
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: PedidosView,
    meta: { requiresAuth: true },
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: ProdutoView,
    meta: { requiresAuth: true },
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriaView,
    meta: { requiresAuth: true },
  },
  {
    path: '/marcas',
    name: 'Marcas',
    component: MarcaView,
    meta: { requiresAuth: true },
  },
  {
    path: '/fornecedores',
    name: 'Fornecedores',
    component: FornecedorView,
    meta: { requiresAuth: true },
  },
  {
    path: '/estoque/dashboard',
    name: 'EstoqueDashboard',
    component: EstoqueDashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/estoque/saldos',
    name: 'EstoqueSaldos',
    component: EstoqueSaldosView,
    meta: { requiresAuth: true },
  },
  {
    path: '/estoque/movimentacoes',
    name: 'EstoqueMovimentacoes',
    component: EstoqueView,
    meta: { requiresAuth: true },
  },
  {
    path: '/conversao-unidades',
    name: 'ConversaoUnidades',
    component: ConversaoUnidadesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClienteView,
    meta: { requiresAuth: true },
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: RelatoriosView,
    meta: { requiresAuth: true },
  },
  {
    path: '/devolucoes',
    name: 'Devolucoes',
    component: DevolucoesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/manual',
    name: 'ManualUsuario',
    component: ManualUsuarioView,
    meta: { requiresAuth: false },
  },
  // Rota antiga para compatibilidade
  {
    path: '/estoque',
    redirect: '/estoque/dashboard',
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.estaAutenticado) {
    next('/login')
  } else if (to.meta.role && authStore.role !== to.meta.role) {
    next('/home')
  } else {
    next()
  }
})

export default router
