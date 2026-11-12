<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
</script>

<template>
  <div class="not-found">
    <EmptyState title="Halaman Tidak Ditemukan (404)" description="Alamat yang Anda buka tidak tersedia.">
      <RouterLink :to="{ name: 'home' }">
        <BaseButton>Kembali</BaseButton>
      </RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
</style>
