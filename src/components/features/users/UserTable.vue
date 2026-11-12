<script setup>
/**
 * Tabel pengguna.
 * Props: users, currentUserId. Emits: edit(user), delete(user), toggle(user).
 */
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import { ROLE_OPTIONS } from '@/config/app'
import { formatDate } from '@/utils/format'

defineProps({
  users: { type: Array, required: true },
  currentUserId: { type: String, default: '' }
})

const emit = defineEmits(['edit', 'delete', 'toggle'])

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Role' },
  { key: 'createdAt', label: 'Dibuat' },
  { key: 'isActive', label: 'Status', align: 'center' },
  { key: 'actions', label: 'Aksi', align: 'right' }
]

const roleLabel = (value) => ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value
</script>

<template>
  <BaseTable :columns="columns" :rows="users" empty-text="Belum ada pengguna.">
    <template #cell-name="{ row }">
      <strong>{{ row.name }}</strong>
      <BaseBadge v-if="row.id === currentUserId" variant="info" class="you">Anda</BaseBadge>
    </template>
    <template #cell-username="{ value }">@{{ value }}</template>
    <template #cell-role="{ value }">
      <BaseBadge variant="primary">{{ roleLabel(value) }}</BaseBadge>
    </template>
    <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
    <template #cell-isActive="{ value }">
      <BaseBadge :variant="value ? 'success' : 'neutral'">{{ value ? 'Aktif' : 'Nonaktif' }}</BaseBadge>
    </template>
    <template #cell-actions="{ row }">
      <div class="actions">
        <BaseButton size="sm" variant="ghost" :disabled="row.id === currentUserId" @click="emit('toggle', row)">
          {{ row.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
        </BaseButton>
        <BaseButton size="sm" variant="outline" @click="emit('edit', row)">Ubah</BaseButton>
        <BaseButton size="sm" variant="danger" :disabled="row.id === currentUserId" @click="emit('delete', row)">
          Hapus
        </BaseButton>
      </div>
    </template>
  </BaseTable>
</template>

<style scoped>
.you {
  margin-left: var(--space-2);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1);
}
</style>
