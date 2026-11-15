<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore, summarize, topProducts } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { clearAppStorage } from '@/services/storage'
import { formatCurrency, formatDate, toDateKey } from '@/utils/format'
import { addDays } from '@/utils/orderDates'
import { useNow } from '@/composables/useNow'
import { ORDER_STATUS, DISPLAY_LIMITS } from '@/config/app'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import TopProductList from '@/components/features/dashboard/TopProductList.vue'
import LowStockList from '@/components/features/dashboard/LowStockList.vue'
import OrderTable from '@/components/features/orders/OrderTable.vue'
import OrderDetail from '@/components/features/orders/OrderDetail.vue'

const { recentOrders: RECENT_LIMIT, topProductDays: TOP_PERIOD_DAYS } = DISPLAY_LIMITS

const orders = useOrdersStore()
const products = useProductsStore()

// Ikut waktu berjalan, jadi dashboard yang dibiarkan terbuka berganti hari sendiri setelah tengah malam.
const now = useNow()
const todayKey = computed(() => toDateKey(now.value))
// Omzet dihitung dari pesanan yang diserahkan hari ini (berdasarkan tanggal terima).
const today = computed(() => summarize(orders.ordersForDate(todayKey.value)))
const tomorrow = computed(() => summarize(orders.ordersForDate(addDays(todayKey.value, 1))))
const tomorrowPending = computed(
  () => orders.ordersForDate(addDays(todayKey.value, 1)).filter((o) => o.status === ORDER_STATUS.PENDING).length
)

const topWeek = computed(() => {
  const start = new Date(now.value)
  start.setDate(start.getDate() - (TOP_PERIOD_DAYS - 1))
  return topProducts(orders.filterOrders({ from: toDateKey(start) }))
})

const recentOrders = computed(() => orders.sorted.slice(0, RECENT_LIMIT))

const selectedOrder = ref(null)
const showReset = ref(false)

function resetDemoData() {
  clearAppStorage()
  window.location.reload()
}
</script>

<template>
  <PageHeader title="Dashboard Owner" :subtitle="`Ringkasan hari ini, ${formatDate(now)}`">
    <BaseButton variant="outline" size="sm" @click="showReset = true">Reset Data Demo</BaseButton>
  </PageHeader>

  <div class="grid-stats">
    <StatCard
      label="Omzet Hari Ini"
      :value="formatCurrency(today.revenue)"
      :hint="`${today.count} pesanan untuk hari ini`"
      variant="success"
    />
    <StatCard
      label="Pesanan Besok"
      :value="tomorrow.count + tomorrowPending"
      :hint="`${tomorrow.portions} porsi dikonfirmasi, ${tomorrowPending} menunggu konfirmasi`"
    />
    <StatCard
      label="Belum Lunas"
      :value="orders.unpaidActiveOrders.length"
      hint="Pesanan aktif yang belum dibayar"
      variant="warning"
    />
    <StatCard
      label="Stok Menipis"
      :value="products.lowStockProducts.length"
      hint="Menu di bawah stok minimum"
      variant="danger"
    />
  </div>

  <div class="grid-2">
    <TopProductList :items="topWeek" :title="`Menu Terlaris (${TOP_PERIOD_DAYS} Hari)`" />
    <LowStockList :products="products.lowStockProducts" />
  </div>

  <section class="card">
    <h2 class="section-title">Pesanan Terbaru</h2>
    <OrderTable :orders="recentOrders" @detail="selectedOrder = $event" />
  </section>

  <OrderDetail :show="Boolean(selectedOrder)" :order="selectedOrder" @close="selectedOrder = null" />
  <ConfirmDialog
    :show="showReset"
    title="Reset Data Demo"
    message="Semua data di localStorage akan dihapus dan dimuat ulang dari file seed JSON. Lanjutkan?"
    confirm-text="Reset"
    @confirm="resetDemoData"
    @cancel="showReset = false"
  />
</template>
