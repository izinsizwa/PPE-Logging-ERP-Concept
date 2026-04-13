<template>
  <div class="login-bg">
    <div class="login-wrap">
      <div class="login-logo">
        <div class="login-icon"><i class="fa-solid fa-hard-hat"></i></div>
        <div class="login-org">Transnet SOC Ltd</div>
        <h1 class="login-title">PPE Management</h1>
        <p class="login-sub">Administrator portal — authorised access only</p>
      </div>

      <div class="glass login-card">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" type="text" v-model="username" placeholder="Enter your username" @keydown.enter="submit" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" v-model="password" placeholder="Enter your password" @keydown.enter="submit" />
        </div>

        <div v-if="error" class="login-error">
          <i class="fa-solid fa-circle-exclamation"></i> Invalid credentials. Please try again.
        </div>

        <button class="btn btn-primary btn-block" @click="submit">
          Sign In <i class="fa-solid fa-arrow-right"></i>
        </button>

        <p class="demo-hint">
          Demo: <code>admin</code> / <code>transnet2025</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const username = ref('')
const password = ref('')
const error    = ref(false)

function submit() {
  if (auth.login(username.value, password.value)) {
    router.push('/dashboard')
  } else {
    error.value = true
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(145deg, #dde3f5, #e8ecff, #d8dff5);
}
.login-wrap { width: 420px; }
.login-logo { text-align: center; margin-bottom: 32px; }
.login-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 60px; height: 60px; border-radius: 18px;
  background: var(--grad1); box-shadow: 0 8px 24px rgba(108,99,255,.35);
  font-size: 26px; color: #fff; margin-bottom: 16px;
}
.login-org   { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.login-title { font-size: 24px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 6px; }
.login-sub   { font-size: 13px; color: var(--muted); }
.glass.login-card { padding: 36px; }
.login-error {
  font-size: 12px; color: var(--red);
  background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2);
  border-radius: var(--r-xs); padding: 10px 14px; margin-bottom: 16px;
}
.demo-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: 16px; line-height: 1.9; }
.demo-hint code { background: rgba(108,99,255,.1); color: var(--accent); padding: 1px 6px; border-radius: 4px; font-family: 'DM Mono', monospace; }
</style>
