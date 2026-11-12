<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_METHOD, PAYMENT_STATUS } from '@/config/app'
import { formatDeliveryDate } from '@/utils/orderDates'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import OrderProgress from '@/components/features/customer/OrderProgress.vue'
import OrderReceipt from '@/components/features/customer/OrderReceipt.vue'
import PaymentInstructions from '@/components/features/customer/PaymentInstructions.vue'

const route = useRoute()
const orders = useOrdersStore()
const settings = useSettingsStore()

// Store pesanan sinkron antar-tab, jadi status di halaman ini ikut berubah sendiri.
const order = computed(() => orders.getById(route.params.id))
const isCancelled = computed(() => order.value?.status === ORDER_STATUS.CANCELLED)
const handoverHours = computed(() => `${settings.data.handoverStart}–${settings.data.handoverEnd}`)
const needsTransfer = computed(
  () =>
    !isCancelled.value &&
    order.value?.paymentMethod === PAYMENT_METHOD.PREPAID &&
    order.value?.paymentStatus === PAYMENT_STATUS.UNPAID
)

const headline = computed(() => {
  const o = order.value
  if (!o) return ''
  const delivery = o.orderType === ORDER_TYPE.DELIVERY
  const day = formatDeliveryDate(o.deliveryDate)
  return {
    [ORDER_STATUS.PENDING]: 'Menunggu Admin memeriksa pesanan dan ketersediaan bahan.',
    [ORDER_STATUS.PROCESSING]: `Pesanan diterima dan dijadwalkan dibuat untuk ${day}.`,
    [ORDER_STATUS.READY]: delivery
      ? 'Dimsum sudah siap dan sedang diserahkan ke kurir.'
      : 'Dimsum sudah siap. Sebutkan nama dan nomor pesanan saat mengambil.',
    [ORDER_STATUS.COMPLETED]: 'Pesanan selesai. Selamat menikmati.',
    [ORDER_STATUS.CANCELLED]:
      (o.confirmedAt
        ? 'Pesanan ini dibatalkan.'
        : 'Pesanan ini tidak dapat diterima, misalnya karena bahan tidak tersedia atau alamat di luar jangkauan.') +
      (o.paymentStatus === PAYMENT_STATUS.PAID ? ' Pembayaran Anda akan dikembalikan oleh Admin.' : '')
  }[o.status]
})
</script>

<template>
  <EmptyState
    v-if="!order"
    title="Pesanan tidak ditemukan"
    description="Tautan ini tidak cocok dengan pesanan di perangkat ini. Buka halaman pemesanan untuk memesan."
  >
    <RouterLink :to="{ name: 'customer-order' }">
      <BaseButton>Buka halaman pemesanan</BaseButton>
    </RouterLink>
  </EmptyState>

  <div v-else class="status">
    <section class="status__main">
      <p class="status__number figure">Pesanan #{{ order.queueNo }}</p>
      <h1>{{ order.customerName }}</h1>
      <p class="status__headline" aria-live="polite">{{ headline }}</p>

      <OrderProgress v-if="!isCancelled" :order="order" />
      <PaymentInstructions v-if="needsTransfer" :order="order" :settings="settings.data" />

      <RouterLink :to="{ name: 'customer-order' }" class="status__again">
        <BaseButton :variant="isCancelled ? 'primary' : 'outline'">Pesan lagi</BaseButton>
      </RouterLink>
    </section>

    <OrderReceipt :order="order" :pickup-address="settings.data.pickupAddress" :handover-hours="handoverHours" />
  </div>
</template>

<style scoped>
.status {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: var(--space-8);
  align-items: start;
}

.status__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.status__number {
  font-size: 44px;
  color: var(--color-chili);
}

.status__headline {
  max-width: 48ch;
  font-size: var(--font-size-lead);
}

.status__again {
  align-self: flex-start;
  margin-top: var(--space-3);
}

@media (max-width: 860px) {
  .status {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }
}
</style>
