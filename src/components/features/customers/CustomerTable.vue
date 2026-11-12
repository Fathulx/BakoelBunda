<script setup>
/**
 * Tabel data pelanggan beserta ringkasan pesanannya.
 * Props: rows [{ id, name, phone, orderCount, totalSpent, lastOrderAt }].
 * Emits: detail(row).
 */
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency, formatDateTime, toWhatsAppLink } from '@/utils/format'

defineProps({
  rows: { type: Array, required: true }
})

const emit = defineEmits(['detail'])

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'phone', label: 'WhatsApp' },
  { key: 'orderCount', label: 'Pesanan', align: 'right' },
  { key: 'totalSpent', label: 'Total Belanja', align: 'right' },
  { key: 'lastOrderAt', label: 'Pesanan Terakhir' },
  { key: 'actions', label: '', align: 'right' }
]
</script>

<template>
  <BaseTable :columns="columns" :rows="rows" empty-text="Belum ada pelanggan.">
    <template #cell-phone="{ value }">
      <a :href="toWhatsAppLink(value)" target="_blank" rel="noopener" class="wa">{{ value }}</a>
    </template>
    <template #cell-totalSpent="{ value }">
      <strong>{{ formatCurrency(value) }}</strong>
    </template>
    <template #cell-lastOrderAt="{ value }">{{ formatDateTime(value) }}</template>
    <template #cell-actions="{ row }">
      <BaseButton size="sm" variant="outline" @click="emit('detail', row)">Detail</BaseButton>
    </template>
  </BaseTable>
</template>

<style scoped>
.wa {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
