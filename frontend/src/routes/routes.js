import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    
    path: '/',
    component: () => import('../layouts/WelcomeLayout.vue'),
    children: [{ path: '', component: () => import('../views/inicio.vue') }]
  },
  {
    path: '/categorias',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/CategoriasView.vue') }]
  },
  {
    path: '/dashboard',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/DashboardView.vue') }]
  },
  {
    path: '/inventario',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/InventarioView.vue') }]
  },
  {
    path: '/movimientos',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/MovimientosView.vue') }]
  },
  {
    path: '/producto-detalles/:id',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/ProductoDetalleView.vue') }]
  },
  {
    path: '/proveedores',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/ProveedoresView.vue') }]
  },
  {
    path: '/reportes',
    component: () => import('../layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('../views/ReportesView.vue') }]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})