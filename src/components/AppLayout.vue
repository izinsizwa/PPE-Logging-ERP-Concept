<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo"><i class="fa-solid fa-hard-hat"></i></div>

      <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="nav-icon" :title="item.title" active-class="active">
        <i :class="item.icon"></i>
        <span v-if="item.badge" class="nav-badge"></span>
      </router-link>

      <button class="nav-icon" title="Scan Barcode" style="margin-top:8px" @click="$emit('scan', 'general')">
        <i class="fa-solid fa-barcode"></i>
      </button>

      <div class="sidebar-bottom">
        <button class="nav-icon" title="Sign out" @click="handleLogout">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
        <div class="user-avatar">{{ auth.currentAdmin?.initial }}</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-area">
      <!-- Topbar -->
      <header class="topbar">
        <div>
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-sub">{{ subtitle }}</p>
        </div>
        <div class="topbar-right">
          <div class="topbar-user">
            <div class="topbar-name">{{ auth.currentAdmin?.name }}</div>
            <div class="topbar-role">{{ auth.currentAdmin?.role }}</div>
          </div>
          <button class="btn btn-outline btn-sm" @click="handleLogout">Sign out</button>
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePpeStore } from '@/stores/ppe'

defineProps({ title: String, subtitle: String })
defineEmits(['scan'])

const auth   = useAuthStore()
const store  = usePpeStore()
const router = useRouter()

const hasAlerts = computed(() => store.stockAlerts.length > 0)

const navItems = computed(() => [
  { to: '/dashboard', title: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/employees', title: 'Employees',  icon: 'fa-solid fa-users' },
  { to: '/inventory', title: 'Inventory',  icon: 'fa-solid fa-boxes-stacked', badge: hasAlerts.value },
  { to: '/catalogue', title: 'Catalogue',  icon: 'fa-solid fa-list' },
])

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout { display: flex; min-height: 100vh; }

.sidebar {
  width: 72px; background: rgba(255,255,255,.45);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255,255,255,.7);
  display: flex; flex-direction: column; align-items: center;
  padding: 20px 0; position: sticky; top: 0; height: 100vh;
  gap: 4px; flex-shrink: 0;
}
.sidebar-logo {
  width: 42px; height: 42px; border-radius: 12px;
  background: var(--grad1); display: flex; align-items: center;
  justify-content: center; font-size: 18px; color: #fff;
  margin-bottom: 28px; box-shadow: 0 4px 12px rgba(108,99,255,.35);
}
.nav-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s; color: var(--muted);
  font-size: 16px; position: relative; background: transparent;
  border: none; font-family: inherit; text-decoration: none;
}
.nav-icon:hover { background: rgba(108,99,255,.08); color: var(--accent); }
.nav-icon.active { background: var(--grad1); color: #fff; box-shadow: 0 4px 14px rgba(108,99,255,.35); }
.nav-badge { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: var(--red); border-radius: 50%; border: 2px solid var(--bg); }
.sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--grad2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 2px solid rgba(255,255,255,.8); box-shadow: 0 2px 8px rgba(108,99,255,.25); }

.main-area { flex: 1; display: flex; flex-direction: column; min-height: 100vh; overflow: hidden; }

.topbar { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px 0; margin-bottom: 28px; }
.page-title { font-size: 22px; font-weight: 700; letter-spacing: -.02em; }
.page-sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-user { text-align: right; }
.topbar-name { font-size: 13px; font-weight: 600; }
.topbar-role { font-size: 11px; color: var(--muted); }

.content { flex: 1; padding: 0 32px 32px; overflow-y: auto; }
</style>
