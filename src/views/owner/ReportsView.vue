<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore, summarize, topProducts } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import OrderFilter from '@/components/features/orders/OrderFilter.vue'
import OrderTable from '@/components/features/orders/OrderTable.vue'
import OrderDetail from '@/components/features/orders/OrderDetail.vue'
import TopProductList from '@/components/features/dashboard/TopProductList.vue'

const orders = useOrdersStore()

const emptyFilter = () => ({
  from: '',
  to: '',
  status: '',
  paymentMethod: '',
  paymentStatus: '',
  orderType: '',
  search: ''
})
const filter = ref(emptyFilter())
const selectedOrder = ref(null)

const results = computed(() => orders.filterOrders(filter.value))
const summary = computed(() => summarize(results.value))
const top = computed(() => topProducts(results.value))

const resetFilter = () => (filter.value = emptyFilter())
</script>

<template>
  <PageHeader title="Laporan Penjualan" subtitle="Rekap omzet berdasarkan tanggal terima pesanan dan filter lain." />

  <OrderFilter v-model="filter" @reset="resetFilter" />

  <div class="grid-stats">
    <StatCard label="Total Omzet" :value="formatCurrency(summary.revenue)" variant="success" />
    <StatCard label="Pesanan Berhasil" :value="summary.count" :hint="`${summary.portions} porsi`" />
    <StatCard label="Rata-rata / Pesanan" :value="formatCurrency(summary.average)" variant="info" />
    <StatCard label="Dibatalkan" :value="summary.cancelled" variant="danger" />
  </div>

  <TopProductList :items="top" title="Menu Terlaris (Sesuai Filter)" />

  <section class="card">
    <h2 class="section-title">Daftar Pesanan ({{ results.length }})</h2>
    <OrderTable :orders="results" @detail="selectedOrder = $event" />
  </section>

  <OrderDetail :show="Boolean(selectedOrder)" :order="selectedOrder" @close="selectedOrder = null" />
</template>
