import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import EmployeesView from '@/views/EmployeesView.vue'
import EmployeeDetailView from '@/views/EmployeeDetailView.vue'
import InventoryView from '@/views/InventoryView.vue'
import CatalogueView from '@/views/CatalogueView.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/employees', name: 'employees', component: EmployeesView },
  { path: '/employees/:id', name: 'employee-detail', component: EmployeeDetailView },
  { path: '/inventory', name: 'inventory', component: InventoryView },
  { path: '/catalogue', name: 'catalogue', component: CatalogueView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
