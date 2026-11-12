<script setup>
/**
 * Kartu pesanan untuk antrean (Pesanan Aktif Admin dan Antrean Dapur).
 * Props: order, actions [{ status, label, variant }], today ("YYYY-MM-DD", untuk sorotan pesanan hari ini),
 *        showContact (tampilkan WhatsApp dan alamat), canMarkPaid (tampilkan tombol "Tandai lunas").
 * Emits: action({ order, status }), mark-paid(order).
 */
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import OrderStatusBadge from './OrderStatusBadge.vue'
import PaymentStatusBadge from './PaymentStatusBadge.vue'
import OrderContact from './OrderContact.vue'
import { useSettingsStore } from '@/stores/settings'
import { ORDER_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS, ORDER_STATUS } from '@/config/app'
import { formatDateTime, toDateKey } from '@/utils/format'
import { formatDeliveryDate, isLateOrder } from '@/utils/orderDates'

const props = defineProps({
  order: { type: Object, required: true },
  actions: { type: Array, default: () => [] },
  today: { type: String, default: () => toDateKey() },
  showContact: { type: Boolean, default: false },
  canMarkPaid: { type: Boolean, default: false }
})

const emit = defineEmits(['action', 'mark-paid'])

const settings = useSettingsStore()

const findShort = (options, value) => options.find((o) => o.value === value)
const orderTypeLabel = computed(() => findShort(ORDER_TYPE_OPTIONS, props.order.orderType)?.label ?? '-')
const paymentLabel = computed(() => findShort(PAYMENT_METHOD_OPTIONS, props.order.paymentMethod)?.short ?? '-')
const isDueToday = computed(() => props.order.deliveryDate === props.today)
const isLate = computed(() => isLateOrder(props.order, settings.data))
const showPayButton = computed(
  () =>
    props.canMarkPaid &&
    props.order.paymentStatus === PAYMENT_STATUS.UNPAID &&
    props.order.status !== ORDER_STATUS.CANCELLED
)
</script>

<template>
  <article :class="['order-card', `order-card--${order.status}`, { 'order-card--today': isDueToday }]">
    <header class="order-card__header">
      <p class="order-card__queue figure" :aria-label="`Nomor antrean ${order.queueNo}`">{{ order.queueNo }}</p>
      <div class="order-card__customer">
        <h3>{{ order.customerName }}</h3>
        <p class="order-card__date">
          <template v-if="isDueToday">Hari ini, </template>{{ formatDeliveryDate(order.deliveryDate) }}
        </p>
        <p class="order-card__meta">{{ orderTypeLabel }}, dipesan {{ formatDateTime(order.createdAt) }}</p>
        <div class="order-card__badges">
          <OrderStatusBadge :status="order.status" />
          <PaymentStatusBadge :status="order.paymentStatus" />
          <BaseBadge v-if="isLate" variant="warning">Pesanan susulan</BaseBadge>
        </div>
      </div>
    </header>

    <ul class="order-card__items">
      <li v-for="item in order.items" :key="item.productId">
        <span class="order-card__qty">{{ item.qty }}</span>
        <span>{{ item.name }}</span>
      </li>
    </ul>

    <p v-if="order.note" class="order-card__note">Catatan: {{ order.note }}</p>

    <OrderContact v-if="showContact" :order="order" />

    <footer class="order-card__footer">
      <span class="order-card__pay">{{ paymentLabel }}</span>
      <div class="row">
        <BaseButton v-if="showPayButton" size="sm" variant="secondary" @click="emit('mark-paid', order)">
          Tandai lunas
        </BaseButton>
        <BaseButton
          v-for="action in actions"
          :key="action.status"
          size="sm"
          :variant="action.variant"
          @click="emit('action', { order, status: action.status })"
        >
          {{ action.label }}
        </BaseButton>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.order-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.order-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.order-card__queue {
  min-width: 2ch;
  font-size: 40px;
  color: var(--color-chili);
}

.order-card__queue::before {
  content: '#';
  font-size: 0.55em;
  vertical-align: 0.6em;
  margin-right: 1px;
}

.order-card--siap .order-card__queue {
  color: var(--color-primary);
}

.order-card__customer {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.order-card__meta {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}

/* Daftar item seperti bon dapur: garis sobek di atas. */
.order-card__items {
  margin: 0;
  padding: var(--space-3) 0 0;
  list-style: none;
  border-top: 2px dashed var(--color-border-strong);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--font-size-lead);
}

.order-card__items li {
  display: flex;
  gap: var(--space-3);
}

.order-card__qty {
  min-width: 2ch;
  text-align: right;
  font-weight: var(--font-weight-bold);
}

.order-card__qty::after {
  content: 'x';
  font-weight: var(--font-weight-regular);
  color: var(--color-text-muted);
  margin-left: 1px;
}

.order-card__note {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-secondary-soft);
  font-weight: var(--font-weight-medium);
}

.order-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: auto;
}

.order-card__pay {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}

/* Pesanan yang harus diserahkan hari ini diberi garis tepi tebal supaya didahulukan. */
.order-card--today {
  border: 2px solid var(--color-secondary);
}

.order-card__date {
  font-weight: var(--font-weight-semibold);
}

.order-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-1);
}
</style>
