<script setup>
/** Kerangka halaman setelah login: sidebar, header, dan area konten. */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_HOME } from '@/config/app'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const sidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Sesi berubah dari tab lain: keluar → ke halaman login; ganti akun → ke halaman awal role yang baru
// (bila halaman sekarang tidak boleh dibuka role tersebut).
watch(
  () => auth.user?.id,
  () => {
    if (!auth.isLoggedIn) router.push({ name: 'login' })
    else if (route.meta.roles && !auth.hasRole(route.meta.roles)) router.push({ name: ROLE_HOME[auth.role] })
  }
)

// Tutup sidebar (mode mobile) setiap pindah halaman.
watch(
  () => route.fullPath,
  () => (sidebarOpen.value = false)
)
</script>

<template>
  <div class="layout">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="layout__main">
      <AppHeader @toggle-menu="sidebarOpen = !sidebarOpen" />
      <main class="layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.layout__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layout__content {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

@media (max-width: 640px) {
  .layout__content {
    padding: var(--space-4);
  }
}
</style>
