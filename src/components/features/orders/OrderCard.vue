<script setup>
/**
 * Kartu pesanan untuk antrean (Pesanan Aktif Admin dan Antrean Dapur). Status pesanan tidak ditampilkan
 * di kartu karena kartu sudah dikelompokkan per status (judul kolom/bagian).
 * Props: order, actions [{ status, label, variant }], today ("YYYY-MM-DD", untuk label Hari ini/Besok/Terlambat),
 *        showContact (tampilkan WhatsApp dan alamat), canMarkPaid (tampilkan tautan "Tandai lunas").
 * Emits: action({ order, status }), mark-paid(order).
 */
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import PaymentStatusBadge from './PaymentStatusBadge.vue'
import OrderContact from './OrderContact.vue'
import { useSettingsStore } from '@/stores/settings'
import { ORDER_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS, ORDER_STATUS } from '@/config/app'
import { formatShortDateTime, toDateKey } from '@/utils/format'
import { formatDeliveryDate, isLateOrder, relativeDayLabel } from '@/utils/orderDates'

const props = defineProps({
  order: { type: Object, required: true },
  actions: { type: Array, default: () => [] },
  today: { type: String, default: () => toDateKey() },
  showContact: { type: Boolean, default: false },
  canMarkPaid: { type: Boolean, default: false }
})

const emit = defineEmits(['action', 'mark-paid'])

const settings = useSettingsStore()

const findOption = (options, value) => options.find((o) => o.value === value)
const orderTypeLabel = computed(() => findOption(ORDER_TYPE_OPTIONS, props.order.orderType)?.label ?? '-')
const paymentLabel = computed(() => findOption(PAYMENT_METHOD_OPTIONS, props.order.paymentMethod)?.short ?? '-')
const relativeDay = computed(() => relativeDayLabel(props.order.deliveryDate, props.today))
const isLate = computed(() => isLateOrder(props.order, settings.data))
const showPayButton = computed(
  () =>
    props.canMarkPaid &&
    props.order.paymentStatus === PAYMENT_STATUS.UNPAID &&
    props.order.status !== ORDER_STATUS.CANCELLED
)
</script>

<template>
  <article :class="['order-card', `order-card--${order.status}`, `order-card--due-${relativeDay.tone}`]">
    <header class="order-card__header">
      <p class="order-card__queue figure" :aria-label="`Nomor antrean ${order.queueNo}`">{{ order.queueNo }}</p>
      <div class="order-card__customer">
        <div class="order-card__title">
          <h3>{{ order.customerName }}</h3>
          <BaseBadge :variant="relativeDay.tone">{{ relativeDay.label }}</BaseBadge>
        </div>
        <p class="order-card__date">{{ formatDeliveryDate(order.deliveryDate) }}</p>
        <p class="order-card__meta">{{ orderTypeLabel }} · dipesan {{ formatShortDateTime(order.createdAt) }}</p>
        <p v-if="isLate" class="order-card__late">
          <AppIcon name="history" :size="14" />
          Pesanan susulan (masuk setelah jam batas)
        </p>
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

    <!-- Semua info pembayaran dalam satu baris: metode · status · aksi tandai lunas. -->
    <div class="order-card__payment">
      <span>{{ paymentLabel }}</span>
      <span aria-hidden="true">·</span>
      <PaymentStatusBadge :status="order.paymentStatus" />
      <template v-if="showPayButton">
        <span aria-hidden="true">·</span>
        <button type="button" class="order-card__paid-link" @click="emit('mark-paid', order)">Tandai lunas</button>
      </template>
    </div>

    <footer v-if="actions.length" class="order-card__footer">
      <BaseButton
        v-for="action in actions"
        :key="action.status"
        size="sm"
        :variant="action.variant"
        @click="emit('action', { order, status: action.status })"
      >
        {{ action.label }}
      </BaseButton>
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
  justify-content: flex-end;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: auto;
}

.order-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.order-card__payment {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
}

.order-card__paid-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

/* Pesanan yang harus diserahkan hari ini diberi garis tepi tebal supaya didahulukan. */
/* Garis tepi mengikuti label tanggal: emas = hari ini, merah = terlambat. */
.order-card--due-warning {
  border: 2px solid var(--color-secondary);
}

.order-card--due-danger {
  border: 2px solid var(--color-danger);
}

.order-card__date {
  font-weight: var(--font-weight-semibold);
}

.order-card__late {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-warning-text);
}


</style>
