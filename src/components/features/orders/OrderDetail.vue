<script setup>
/**
 * Detail pesanan berbentuk struk.
 * Props: show, order, title. Emits: close.
 */
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import OrderStatusBadge from './OrderStatusBadge.vue'
import { APP_CONFIG, ORDER_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/config/app'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { formatDeliveryDate } from '@/utils/orderDates'

const props = defineProps({
  show: { type: Boolean, default: false },
  order: { type: Object, default: null },
  title: { type: String, default: 'Detail Pesanan' }
})

const emit = defineEmits(['close'])

const findLabel = (options, value) => options.find((o) => o.value === value)?.label ?? '-'

const info = computed(() => {
  if (!props.order) return []
  const o = props.order
  return [
    { label: 'No. Invoice', value: o.invoiceNo },
    { label: 'Dipesan', value: formatDateTime(o.createdAt) },
    { label: 'Untuk tanggal', value: formatDeliveryDate(o.deliveryDate) },
    { label: 'Pelanggan', value: o.customerName },
    o.customerPhone && { label: 'WhatsApp', value: o.customerPhone },
    { label: 'Diterima', value: findLabel(ORDER_TYPE_OPTIONS, o.orderType) },
    o.address && { label: 'Alamat', value: o.address },
    o.note && { label: 'Catatan', value: o.note },
    { label: 'Ditangani', value: o.handledByName ?? 'Belum dikonfirmasi' },
    { label: 'Pembayaran', value: findLabel(PAYMENT_METHOD_OPTIONS, o.paymentMethod) },
    { label: 'Status bayar', value: findLabel(PAYMENT_STATUS_OPTIONS, o.paymentStatus) },
    o.paidAt && { label: 'Lunas pada', value: formatDateTime(o.paidAt) }
  ].filter(Boolean)
})
</script>

<template>
  <BaseModal :show="show && Boolean(order)" :title="title" width="440px" @close="emit('close')">
    <div v-if="order" class="receipt">
      <div class="receipt__head">
        <p class="receipt__brand">{{ APP_CONFIG.businessName }}</p>
        <p class="receipt__queue">Antrean #{{ order.queueNo }}</p>
        <OrderStatusBadge :status="order.status" />
      </div>

      <dl class="receipt__info">
        <template v-for="row in info" :key="row.label">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </template>
      </dl>

      <table class="receipt__items">
        <tbody>
          <tr v-for="item in order.items" :key="item.productId">
            <td>
              {{ item.name }}
              <div class="text-muted text-small">{{ item.qty }} × {{ formatCurrency(item.price) }}</div>
            </td>
            <td class="text-right">{{ formatCurrency(item.subtotal) }}</td>
          </tr>
        </tbody>
      </table>

      <dl class="receipt__total">
        <dt>Total</dt>
        <dd>{{ formatCurrency(order.total) }}</dd>
      </dl>
    </div>
    <template #footer>
      <BaseButton @click="emit('close')">Tutup</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.receipt {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.receipt__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding-bottom: var(--space-3);
  border-bottom: 1px dashed var(--color-border);
}

.receipt__brand {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.receipt__queue {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
}

.receipt__info,
.receipt__total {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-4);
  margin: 0;
}

.receipt__info dt,
.receipt__total dt {
  color: var(--color-text-muted);
}

.receipt__info dd,
.receipt__total dd {
  margin: 0;
  text-align: right;
}

.receipt__items {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px dashed var(--color-border);
  border-bottom: 1px dashed var(--color-border);
}

.receipt__items td {
  padding: var(--space-2) 0;
  vertical-align: top;
}

.receipt__total dd:first-of-type {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
</style>
