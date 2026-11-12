<script setup>
/** Daftar menu yang stoknya menipis atau habis. Props: products. */
import EmptyState from '@/components/common/EmptyState.vue'
import StockIndicator from '@/components/features/products/StockIndicator.vue'

defineProps({
  products: { type: Array, required: true }
})
</script>

<template>
  <section class="card">
    <h2 class="section-title">Peringatan Stok</h2>
    <EmptyState v-if="!products.length" title="Semua stok aman" />
    <ul v-else class="low-list">
      <li v-for="product in products" :key="product.id" class="low-list__item">
        <div>
          <p><strong>{{ product.name }}</strong></p>
          <p class="text-muted text-small">Minimum {{ product.minStock }} porsi</p>
        </div>
        <StockIndicator :stock="product.stock" :min-stock="product.minStock" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.low-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.low-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.low-list__item:last-child {
  border-bottom: none;
}
</style>
