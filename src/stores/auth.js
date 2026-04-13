import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ADMINS } from '@/data'

export const useAuthStore = defineStore('auth', () => {
  const currentAdmin = ref(JSON.parse(sessionStorage.getItem('ppe_admin') || 'null'))

  const isLoggedIn = ref(!!currentAdmin.value)

  function login(username, password) {
    const admin = ADMINS.find(a => a.username === username && a.password === password)
    if (admin) {
      currentAdmin.value = admin
      isLoggedIn.value = true
      sessionStorage.setItem('ppe_admin', JSON.stringify(admin))
      return true
    }
    return false
  }

  function logout() {
    currentAdmin.value = null
    isLoggedIn.value = false
    sessionStorage.removeItem('ppe_admin')
  }

  return { currentAdmin, isLoggedIn, login, logout }
})
