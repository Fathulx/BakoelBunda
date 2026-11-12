<script setup>
import { ref, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import MenuCard from '@/components/features/products/MenuCard.vue'

const products = useProductsStore()
const search = ref('')

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return products.activeProducts.filter((p) => p.name.toLowerCase().includes(keyword))
})
</script>

<template>
  <PageHeader title="Katalog Menu" subtitle="Daftar menu aktif beserta harga dan stok terkini.">
    <SearchBar v-model="search" placeholder="Cari menu..." />
  </PageHeader>

  <EmptyState v-if="!filtered.length" title="Menu tidak ditemukan" />
  <div v-else class="menu-grid">
    <MenuCard v-for="product in filtered" :key="product.id" :product="product" />
  </div>
</template>

<style scoped>
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}
</style>
