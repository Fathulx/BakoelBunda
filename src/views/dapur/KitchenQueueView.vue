<script setup>
import { computed } from 'vue'
import { useOrdersStore, summarizeProduction } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useNow } from '@/composables/useNow'
import { ORDER_STATUS } from '@/config/app'
import { toDateKey } from '@/utils/format'
import { formatDeliveryDate } from '@/utils/orderDates'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import OrderCard from '@/components/features/orders/OrderCard.vue'
import ProductionSummary from '@/components/features/kitchen/ProductionSummary.vue'

const orders = useOrdersStore()
const products = useProductsStore()
const auth = useAuthStore()
const toast = useToastStore()
const now = useNow()
const today = computed(() => toDateKey(now.value))

const queueActions = [{ status: ORDER_STATUS.READY, label: 'Tandai siap', variant: 'success' }]

const production = computed(() => summarizeProduction(orders.kitchenQueue, products.byId))

/** Antrean dikelompokkan per tanggal terima (kitchenQueue sudah urut tanggal lalu waktu pesan). */
const queueByDate = computed(() => {
  const groups = new Map()
  for (const order of orders.kitchenQueue) {
    groups.set(order.deliveryDate, [...(groups.get(order.deliveryDate) ?? []), order])
  }
  return [...groups.entries()].map(([deliveryDate, list]) => ({ deliveryDate, orders: list }))
})

function handleAction({ order, status }) {
  const result = orders.updateStatus(order.id, status, auth.role)
  result.ok ? toast.success(result.message) : toast.error(result.message)
}
</script>

<template>
  <PageHeader
    title="Antrean Dapur"
    subtitle="Siapkan bahan sesuai rekap produksi, lalu buat pesanan sesuai tanggal dan nomor antrean."
  />

  <ProductionSummary :groups="production" />

  <EmptyState
    v-if="!orders.kitchenQueue.length"
    title="Antrean kosong"
    description="Pesanan yang sudah diterima Admin akan muncul otomatis di sini."
  />

  <section v-for="group in queueByDate" :key="group.deliveryDate" class="stack">
    <h2>
      Untuk {{ group.deliveryDate === today ? 'hari ini, ' : '' }}{{ formatDeliveryDate(group.deliveryDate) }}
      ({{ group.orders.length }})
    </h2>
    <TransitionGroup tag="div" name="ticket" class="queue">
      <OrderCard
        v-for="order in group.orders"
        :key="order.id"
        :order="order"
        :actions="queueActions"
        :today="today"
        @action="handleAction"
      />
    </TransitionGroup>
  </section>

  <section v-if="orders.readyOrders.length" class="stack">
    <h2>Menunggu Diserahkan Admin ({{ orders.readyOrders.length }})</h2>
    <div class="queue">
      <OrderCard v-for="order in orders.readyOrders" :key="order.id" :order="order" :today="today" />
    </div>
  </section>
</template>

<style scoped>
/* Tiket baru turun pelan ke antrean supaya dapur melihat ada pesanan masuk. */
.ticket-enter-active {
  transition: opacity 400ms ease, transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.ticket-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.ticket-move {
  transition: transform 300ms ease;
}

.queue {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
</style>
