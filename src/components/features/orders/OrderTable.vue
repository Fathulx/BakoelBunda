<script setup>
/**
 * Tabel pesanan (Laporan & Dashboard Owner, Riwayat Admin).
 * Props: orders. Emits: detail(order).
 */
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import OrderStatusBadge from './OrderStatusBadge.vue'
import PaymentStatusBadge from './PaymentStatusBadge.vue'
import { PAYMENT_METHOD_OPTIONS } from '@/config/app'
import { formatCurrency } from '@/utils/format'
import { formatDeliveryDate } from '@/utils/orderDates'

defineProps({
  orders: { type: Array, required: true }
})

const emit = defineEmits(['detail'])

const columns = [
  { key: 'invoiceNo', label: 'No. Invoice' },
  { key: 'deliveryDate', label: 'Tanggal Terima' },
  { key: 'customerName', label: 'Pelanggan' },
  { key: 'paymentMethod', label: 'Bayar' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'actions', label: '', align: 'right' }
]

const paymentLabel = (value) => PAYMENT_METHOD_OPTIONS.find((p) => p.value === value)?.short ?? value
</script>

<template>
  <BaseTable :columns="columns" :rows="orders" empty-text="Belum ada pesanan.">
    <template #cell-invoiceNo="{ row }">
      <p class="invoice">{{ row.invoiceNo }}</p>
      <p class="text-muted text-small">Antrean #{{ row.queueNo }}</p>
    </template>
    <template #cell-deliveryDate="{ value }">{{ formatDeliveryDate(value) }}</template>
    <template #cell-paymentMethod="{ row }">
      <p>{{ paymentLabel(row.paymentMethod) }}</p>
      <PaymentStatusBadge :status="row.paymentStatus" />
    </template>
    <template #cell-total="{ value }">
      <strong>{{ formatCurrency(value) }}</strong>
    </template>
    <template #cell-status="{ value }">
      <OrderStatusBadge :status="value" />
    </template>
    <template #cell-actions="{ row }">
      <BaseButton size="sm" variant="outline" @click="emit('detail', row)">Detail</BaseButton>
    </template>
  </BaseTable>
</template>

<style scoped>
.invoice {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-small);
}
</style>
