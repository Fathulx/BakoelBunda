<script setup>
/**
 * Tabel data generik.
 * Props: columns [{ key, label, align? }], rows, rowKey, emptyText.
 * Slot per kolom: #cell-<key>="{ row, value }" untuk tampilan khusus.
 * Di layar HP (≤ 640px) setiap baris tampil sebagai kartu: kolom pertama jadi judul,
 * kolom lain tampil "label: nilai", dan kolom aksi (key "actions" atau tanpa label) di bagian bawah.
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
          <td
            v-for="(col, index) in columns"
            :key="col.key"
            :data-label="col.label"
            :class="[
              `align-${col.align ?? 'left'}`,
              { 'table__cell--title': index === 0, 'table__cell--action': index > 0 && (col.key === 'actions' || !col.label) }
            ]"
          >
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

/* ---------- HP: baris tabel menjadi kartu ---------- */
@media (max-width: 640px) {
  .table-wrapper {
    overflow-x: visible;
  }

  .table,
  .table tbody,
  .table tr,
  .table td {
    display: block;
    width: 100%;
  }

  /* Judul kolom disembunyikan secara visual, tetap terbaca pembaca layar. */
  .table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .table tbody {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .table tbody tr {
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
  }

  .table tbody tr:hover {
    background: var(--color-surface);
  }

  .table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-1) 0;
    border: none;
    text-align: right;
  }

  .table td::before {
    content: attr(data-label);
    flex-shrink: 0;
    text-align: left;
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }

  .table td.table__cell--title {
    display: block;
    padding-bottom: var(--space-2);
    margin-bottom: var(--space-1);
    border-bottom: 1px dashed var(--color-border-strong);
    text-align: left;
    font-weight: var(--font-weight-semibold);
  }

  .table td.table__cell--action {
    justify-content: flex-end;
    padding-top: var(--space-2);
  }

  .table td.table__cell--title::before,
  .table td.table__cell--action::before,
  .table td.table__empty::before {
    content: none;
  }

  .table td.table__empty {
    display: block;
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-lg);
    text-align: center;
  }
}
</style>
