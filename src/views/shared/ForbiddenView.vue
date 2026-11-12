<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_HOME } from '@/config/app'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const auth = useAuthStore()
</script>

<template>
  <section class="card">
    <EmptyState
      title="Akses Ditolak (403)"
      :description="`Role Anda tidak memiliki izin membuka halaman ${route.query.from ?? 'ini'}.`"
    >
      <RouterLink :to="{ name: ROLE_HOME[auth.role] }">
        <BaseButton>Kembali ke Beranda</BaseButton>
      </RouterLink>
    </EmptyState>
  </section>
</template>
