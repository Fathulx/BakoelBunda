<script setup>
/**
 * Rekap produksi dapur per tanggal terima: berapa porsi dan pcs tiap menu yang harus dibuat.
 * Props: groups [{ deliveryDate, items: [{ productId, name, portions, pcs }] }] (hasil summarizeProduction).
 */
import BaseTable from '@/components/common/BaseTable.vue'
import { formatDeliveryDate } from '@/utils/orderDates'

defineProps({
  groups: { type: Array, required: true }
})

const columns = [
  { key: 'name', label: 'Menu' },
  { key: 'portions', label: 'Porsi', align: 'right' },
  { key: 'pcs', label: 'Pcs', align: 'right' }
]

const totalPcs = (items) => items.reduce((sum, item) => sum + item.pcs, 0)
</script>

<template>
  <section class="production card" aria-label="Rekap produksi">
    <h2 class="section-title">Rekap Produksi</h2>
    <p v-if="!groups.length" class="text-muted">Belum ada pesanan yang perlu dibuat.</p>
    <div v-for="group in groups" :key="group.deliveryDate" class="production__day">
      <h3>
        {{ formatDeliveryDate(group.deliveryDate) }}
        <span class="text-muted text-small">· total {{ totalPcs(group.items) }} pcs</span>
      </h3>
      <BaseTable :columns="columns" :rows="group.items" row-key="productId" />
    </div>
  </section>
</template>

<style scoped>
.production {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.production__day {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
