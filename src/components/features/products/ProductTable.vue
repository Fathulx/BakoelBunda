<script setup>
/**
 * Tabel daftar menu untuk Owner.
 * Props: products. Emits: edit(product), delete(product), toggle(product).
 */
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import StockIndicator from './StockIndicator.vue'
import { formatCurrency } from '@/utils/format'

defineProps({
  products: { type: Array, required: true }
})

const emit = defineEmits(['edit', 'delete', 'toggle'])

const columns = [
  { key: 'name', label: 'Menu' },
  { key: 'price', label: 'Harga', align: 'right' },
  { key: 'portionPcs', label: 'Isi', align: 'center' },
  { key: 'stock', label: 'Stok (porsi)', align: 'center' },
  { key: 'minStock', label: 'Stok Min.', align: 'center' },
  { key: 'isActive', label: 'Status', align: 'center' },
  { key: 'actions', label: 'Aksi', align: 'right' }
]
</script>

<template>
  <BaseTable :columns="columns" :rows="products" empty-text="Belum ada menu.">
    <template #cell-name="{ row }">
      <p class="name">{{ row.name }}</p>
      <p class="text-muted text-small">{{ row.description || '-' }}</p>
    </template>
    <template #cell-price="{ value }">{{ formatCurrency(value) }}</template>
    <template #cell-portionPcs="{ value }">{{ value }} pcs</template>
    <template #cell-stock="{ row }">
      <StockIndicator :stock="row.stock" :min-stock="row.minStock" />
    </template>
    <template #cell-isActive="{ row }">
      <BaseBadge :variant="row.isActive ? 'success' : 'neutral'">
        {{ row.isActive ? 'Aktif' : 'Nonaktif' }}
      </BaseBadge>
    </template>
    <template #cell-actions="{ row }">
      <div class="actions">
        <BaseButton size="sm" variant="ghost" @click="emit('toggle', row)">
          {{ row.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
        </BaseButton>
        <BaseButton size="sm" variant="outline" @click="emit('edit', row)">Ubah</BaseButton>
        <BaseButton size="sm" variant="danger" @click="emit('delete', row)">Hapus</BaseButton>
      </div>
    </template>
  </BaseTable>
</template>

<style scoped>
.name {
  font-weight: var(--font-weight-semibold);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1);
}
</style>
