<script setup>
/**
 * Satu pesanan di riwayat pelanggan: tanggal terima, status, isi pesanan, dan total.
 * Props: order.
 */
import OrderStatusBadge from '@/components/features/orders/OrderStatusBadge.vue'
import PaymentStatusBadge from '@/components/features/orders/PaymentStatusBadge.vue'
import { ORDER_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/config/app'
import { formatCurrency } from '@/utils/format'
import { formatDeliveryDate } from '@/utils/orderDates'

defineProps({
  order: { type: Object, required: true }
})

const findLabel = (options, value, key = 'label') => options.find((o) => o.value === value)?.[key] ?? '-'
</script>

<template>
  <li class="item">
    <header class="item__head">
      <div>
        <p class="item__date">{{ formatDeliveryDate(order.deliveryDate) }}</p>
        <p class="text-muted text-small">
          {{ order.invoiceNo }} · {{ findLabel(ORDER_TYPE_OPTIONS, order.orderType) }} ·
          {{ findLabel(PAYMENT_METHOD_OPTIONS, order.paymentMethod, 'short') }}
        </p>
      </div>
      <div class="item__badges">
        <OrderStatusBadge :status="order.status" />
        <PaymentStatusBadge :status="order.paymentStatus" />
      </div>
    </header>

    <ul class="item__lines">
      <li v-for="line in order.items" :key="line.productId">
        <span>{{ line.qty }}x {{ line.name }}</span>
        <span>{{ formatCurrency(line.subtotal) }}</span>
      </li>
    </ul>

    <p v-if="order.note" class="text-muted text-small">Catatan: {{ order.note }}</p>

    <p class="item__total">
      <span>Total</span>
      <strong>{{ formatCurrency(order.total) }}</strong>
    </p>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.item__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.item__date {
  font-weight: var(--font-weight-semibold);
}

.item__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.item__lines {
  margin: 0;
  padding: var(--space-2) 0 0;
  list-style: none;
  border-top: 1px dashed var(--color-border-strong);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.item__lines li,
.item__total {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

.item__total strong {
  color: var(--color-chili);
}
</style>
