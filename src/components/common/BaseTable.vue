<script setup>
/**
 * Tabel data generik.
 * Props: columns [{ key, label, align? }], rows, rowKey, emptyText.
 * Slot per kolom: #cell-<key>="{ row, value }" untuk tampilan khusus.
 */
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  emptyText: { type: String, default: 'Belum ada data.' }
})
</script>

<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :class="`align-${col.align ?? 'left'}`">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row[rowKey]">
          <td v-for="col in columns" :key="col.key" :class="`align-${col.align ?? 'left'}`">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="table__empty">{{ emptyText }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

th {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  background: var(--color-bg);
  white-space: nowrap;
}

tbody tr:hover {
  background: var(--color-bg);
}

.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }

.table__empty {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-muted);
}
</style>
