<script setup>
/**
 * Daftar menu terlaris dengan bar proporsional.
 * Props: items [{ productId, name, qty, revenue }], title.
 */
import { computed } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { formatCurrency } from '@/utils/format'

const props = defineProps({
  items: { type: Array, required: true },
  title: { type: String, default: 'Menu Terlaris' }
})

const maxQty = computed(() => Math.max(1, ...props.items.map((i) => i.qty)))
</script>

<template>
  <section class="card">
    <h2 class="section-title">{{ title }}</h2>
    <EmptyState v-if="!items.length" title="Belum ada penjualan" />
    <ol v-else class="top-list">
      <li v-for="(item, index) in items" :key="item.productId" class="top-list__item">
        <div class="top-list__row">
          <span><strong>{{ index + 1 }}.</strong> {{ item.name }}</span>
          <span class="text-muted text-small">{{ item.qty }} porsi, {{ formatCurrency(item.revenue) }}</span>
        </div>
        <div class="top-list__bar">
          <div class="top-list__fill" :style="{ width: `${(item.qty / maxQty) * 100}%` }" />
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.top-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.top-list__row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-1);
}

.top-list__bar {
  height: 8px;
  border-radius: 999px;
  background: var(--color-bg);
  overflow: hidden;
}

.top-list__fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-secondary);
}
</style>
