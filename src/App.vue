<template>
  <div>
    <router-view />
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="toast.visible" class="toast" :style="{ background: toast.error ? 'var(--red)' : 'linear-gradient(135deg,#6c63ff,#a78bfa)' }">
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { provide, reactive } from 'vue'

const toast = reactive({ visible: false, message: '', error: false })
let toastTimer = null

function showToast(message, error = false) {
  toast.message = message
  toast.error = error
  toast.visible = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.visible = false }, 3200)
}

provide('showToast', showToast)
</script>
