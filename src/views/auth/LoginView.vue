<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { APP_CONFIG, ROLE_HOME } from '@/config/app'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BrandMark from '@/components/common/BrandMark.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({ username: '', password: '' })
const errorMessage = ref('')

function submit() {
  const result = auth.login(form.username, form.password)
  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  errorMessage.value = ''
  toast.success(`Masuk sebagai ${auth.user.name}.`)

  // Kembali ke halaman yang tadi diminta, asalkan role-nya berhak.
  const redirect = route.query.redirect
  if (typeof redirect === 'string') {
    const target = router.resolve(redirect)
    if (!target.meta.roles || auth.hasRole(target.meta.roles)) {
      router.push(redirect)
      return
    }
  }
  router.push({ name: ROLE_HOME[auth.role] })
}
</script>

<template>
  <div class="login">
    <div class="login__card card">
      <div class="login__brand">
        <BrandMark :size="64" />
        <h1>{{ APP_CONFIG.businessName }}</h1>
        <p class="text-muted">Catat penjualan, antrean dapur, dan stok.</p>
      </div>

      <form class="stack" novalidate @submit.prevent="submit">
        <BaseInput v-model="form.username" label="Username" autocomplete="username" placeholder="Masukkan username" />
        <BaseInput
          v-model="form.password"
          type="password"
          label="Kata Sandi"
          autocomplete="current-password"
          placeholder="Masukkan kata sandi"
        />
        <p v-if="errorMessage" class="login__error" role="alert">{{ errorMessage }}</p>
        <BaseButton type="submit" size="lg" block>Masuk</BaseButton>
      </form>
    </div>
    <RouterLink :to="{ name: 'customer-order' }" class="login__shop">
      Ingin memesan dimsum? Buka halaman pemesanan
    </RouterLink>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  padding: var(--space-4);
  background: var(--color-primary);
}

.login__shop {
  color: #e6efe8;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.login__card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-8);
  border: none;
  box-shadow: var(--shadow-md);
}

.login__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;
}

.login__brand h1 {
  font-size: var(--font-size-display);
  color: var(--color-primary);
}

@media (max-width: 480px) {
  .login__card {
    padding: var(--space-6) var(--space-5);
  }
}

.login__error {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-weight: var(--font-weight-medium);
}

</style>
