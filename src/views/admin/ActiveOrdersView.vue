<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useNow } from '@/composables/useNow'
import { toDateKey, formatCurrency } from '@/utils/format'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/config/app'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import OrderCard from '@/components/features/orders/OrderCard.vue'

const orders = useOrdersStore()
const auth = useAuthStore()
const toast = useToastStore()
const now = useNow()
const today = computed(() => toDateKey(now.value))

const pendingActions = [
  { status: ORDER_STATUS.CANCELLED, label: 'Tolak', variant: 'outline' },
  { status: ORDER_STATUS.PROCESSING, label: 'Terima', variant: 'primary' }
]
const processingActions = [{ status: ORDER_STATUS.CANCELLED, label: 'Batalkan', variant: 'outline' }]
const readyActions = [{ status: ORDER_STATUS.COMPLETED, label: 'Tandai diserahkan', variant: 'success' }]

const toCancel = ref(null)
const isRejecting = computed(() => toCancel.value?.status === ORDER_STATUS.PENDING)
const cancelMessage = computed(() => {
  const order = toCancel.value
  if (!order) return ''
  const base = isRejecting.value
    ? `Tolak pesanan #${order.queueNo} atas nama ${order.customerName}? Kabari pembeli lewat WhatsApp. Stok akan dikembalikan.`
    : `Batalkan pesanan #${order.queueNo} atas nama ${order.customerName}? Stok akan dikembalikan.`
  const refund =
    order.paymentStatus === PAYMENT_STATUS.PAID
      ? ` Pesanan ini SUDAH LUNAS: kembalikan dana ${formatCurrency(order.total)} ke pembeli.`
      : ''
  return base + refund
})

function applyStatus(order, status) {
  const result = orders.updateStatus(order.id, status, auth.role, auth.user)
  result.ok ? toast.success(result.message) : toast.error(result.message)
}

function handleAction({ order, status }) {
  if (status === ORDER_STATUS.CANCELLED) toCancel.value = order
  else applyStatus(order, status)
}

function markPaid(order) {
  const result = orders.markPaid(order.id, auth.role)
  result.ok ? toast.success(result.message) : toast.error(result.message)
}

function confirmCancel() {
  applyStatus(toCancel.value, ORDER_STATUS.CANCELLED)
  toCancel.value = null
}
</script>

<template>
  <PageHeader
    title="Pesanan Aktif"
    subtitle="Terima pesanan PO, cek pembayaran, lalu serahkan pesanan yang sudah siap ke pembeli atau kurir."
  />

  <div class="board">
    <section class="board__column board__column--pending">
      <h2 class="board__title">Pesanan Baru <span>{{ orders.pendingOrders.length }}</span></h2>
      <EmptyState
        v-if="!orders.pendingOrders.length"
        title="Belum ada pesanan baru"
        description="Pesanan dari halaman pemesanan muncul di sini untuk diterima."
      />
      <OrderCard
        v-for="order in orders.pendingOrders"
        :key="order.id"
        :order="order"
        :actions="pendingActions"
        :today="today"
        show-contact
        can-mark-paid
        @action="handleAction"
        @mark-paid="markPaid"
      />
    </section>

    <section class="board__column">
      <h2 class="board__title">Diproses Dapur <span>{{ orders.kitchenQueue.length }}</span></h2>
      <EmptyState v-if="!orders.kitchenQueue.length" title="Tidak ada pesanan diproses" />
      <OrderCard
        v-for="order in orders.kitchenQueue"
        :key="order.id"
        :order="order"
        :actions="processingActions"
        :today="today"
        show-contact
        can-mark-paid
        @action="handleAction"
        @mark-paid="markPaid"
      />
    </section>

    <section class="board__column board__column--ready">
      <h2 class="board__title">Siap Diserahkan <span>{{ orders.readyOrders.length }}</span></h2>
      <EmptyState v-if="!orders.readyOrders.length" title="Belum ada pesanan siap" />
      <OrderCard
        v-for="order in orders.readyOrders"
        :key="order.id"
        :order="order"
        :actions="readyActions"
        :today="today"
        show-contact
        can-mark-paid
        @action="handleAction"
        @mark-paid="markPaid"
      />
    </section>
  </div>

  <ConfirmDialog
    :show="Boolean(toCancel)"
    :title="isRejecting ? 'Tolak Pesanan' : 'Batalkan Pesanan'"
    :message="cancelMessage"
    :confirm-text="isRejecting ? 'Ya, tolak' : 'Ya, batalkan'"
    @confirm="confirmCancel"
    @cancel="toCancel = null"
  />
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-5);
  align-items: start;
}

.board__column {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-warning-soft);
}

.board__column--pending {
  background: var(--color-primary-soft);
}

.board__column--ready {
  background: var(--color-info-soft);
}

.board__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.board__title span {
  padding: 0 10px;
  border-radius: 999px;
  background: var(--color-surface);
  font-size: var(--font-size-body);
}
</style>
