<script setup>
/**
 * Rincian pesanan untuk pembeli: menu, total, tanggal terima, cara terima, dan status bayar.
 * Props: order, pickupAddress (alamat rumah untuk pesanan ambil), handoverHours (contoh "10:00–17:00").
 */
import { computed } from 'vue'
import PaymentStatusBadge from '@/components/features/orders/PaymentStatusBadge.vue'
import { ORDER_TYPE, ORDER_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/config/app'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { formatDeliveryDate } from '@/utils/orderDates'

const props = defineProps({
  order: { type: Object, required: true },
  pickupAddress: { type: String, default: '' },
  handoverHours: { type: String, default: '' }
})

const findLabel = (options, value) => options.find((o) => o.value === value)?.label ?? '-'
const isPickup = computed(() => props.order.orderType === ORDER_TYPE.PICKUP)
</script>

<template>
  <section class="receipt card" aria-label="Rincian pesanan">
    <h2>Rincian</h2>
    <ul class="lines">
      <li v-for="item in order.items" :key="item.productId">
        <span>{{ item.qty }}x {{ item.name }}</span>
        <span>{{ formatCurrency(item.subtotal) }}</span>
      </li>
    </ul>
    <p class="lines__total">
      <span>Total</span>
      <strong class="figure">{{ formatCurrency(order.total) }}</strong>
    </p>
    <dl class="facts">
      <dt>Untuk tanggal</dt>
      <dd>
        <strong>{{ formatDeliveryDate(order.deliveryDate) }}</strong>
        <template v-if="handoverHours">, pukul {{ handoverHours }}</template>
      </dd>
      <dt>Diterima dengan</dt>
      <dd>{{ findLabel(ORDER_TYPE_OPTIONS, order.orderType) }}</dd>
      <template v-if="order.address">
        <dt>Alamat antar</dt>
        <dd>{{ order.address }}</dd>
      </template>
      <template v-if="isPickup && pickupAddress">
        <dt>Ambil di</dt>
        <dd>{{ pickupAddress }}</dd>
      </template>
      <dt>Pembayaran</dt>
      <dd class="facts__payment">
        {{ findLabel(PAYMENT_METHOD_OPTIONS, order.paymentMethod) }}
        <PaymentStatusBadge :status="order.paymentStatus" />
      </dd>
      <template v-if="order.note">
        <dt>Catatan</dt>
        <dd>{{ order.note }}</dd>
      </template>
      <dt>Dipesan</dt>
      <dd>{{ formatDateTime(order.createdAt) }}</dd>
    </dl>
  </section>
</template>

<style scoped>
.receipt {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.lines {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lines li,
.lines__total {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}

.lines__total {
  padding-top: var(--space-3);
  border-top: 2px dashed var(--color-border-strong);
  align-items: baseline;
  font-weight: var(--font-weight-semibold);
}

.lines__total strong {
  font-size: 24px;
  color: var(--color-chili);
}

.facts {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-4);
  font-size: var(--font-size-small);
}

.facts dt {
  color: var(--color-text-muted);
}

.facts dd {
  margin: 0;
}

.facts__payment {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
</style>
