<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore, summarize } from '@/stores/orders'
import { formatCurrency } from '@/utils/format'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import StatCard from '@/components/common/StatCard.vue'
import OrderTable from '@/components/features/orders/OrderTable.vue'
import OrderDetail from '@/components/features/orders/OrderDetail.vue'

const orders = useOrdersStore()

const search = ref('')
const selectedOrder = ref(null)

const filtered = computed(() => {
  return orders.filterOrders({ search: search.value })
})
const summary = computed(() => summarize(orders.items))
</script>

<template>
  <PageHeader title="Riwayat Pesanan" subtitle="Semua pesanan yang masuk dari halaman pemesanan.">
    <SearchBar v-model="search" placeholder="Cari invoice / nama / WhatsApp..." />
  </PageHeader>

  <div class="grid-stats">
    <StatCard label="Pesanan Berhasil" :value="summary.count" />
    <StatCard label="Total Penjualan" :value="formatCurrency(summary.revenue)" variant="success" />
    <StatCard label="Dibatalkan" :value="summary.cancelled" variant="danger" />
  </div>

  <section class="card">
    <OrderTable :orders="filtered" @detail="selectedOrder = $event" />
  </section>

  <OrderDetail :show="Boolean(selectedOrder)" :order="selectedOrder" @close="selectedOrder = null" />
</template>
