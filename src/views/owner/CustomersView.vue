<script setup>
import { ref, computed } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useOrdersStore } from '@/stores/orders'
import { ORDER_STATUS } from '@/config/app'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import CustomerTable from '@/components/features/customers/CustomerTable.vue'
import CustomerDetail from '@/components/features/customers/CustomerDetail.vue'

const customers = useCustomersStore()
const orders = useOrdersStore()

const search = ref('')
const selectedId = ref(null)

/** Ringkasan per pelanggan dihitung dari pesanan (relasi customers 1–N orders lewat customerId). */
const rows = computed(() => {
  const stats = new Map()
  for (const order of orders.items) {
    const current = stats.get(order.customerId) ?? { orderCount: 0, totalSpent: 0, lastOrderAt: null }
    current.orderCount += 1
    if (order.status !== ORDER_STATUS.CANCELLED) current.totalSpent += order.total
    if (!current.lastOrderAt || order.createdAt > current.lastOrderAt) current.lastOrderAt = order.createdAt
    stats.set(order.customerId, current)
  }

  const keyword = search.value.trim().toLowerCase()
  return customers.items
    .filter((c) => !keyword || c.name.toLowerCase().includes(keyword) || c.phone.includes(keyword))
    .map((c) => ({ ...c, orderCount: 0, totalSpent: 0, lastOrderAt: null, ...stats.get(c.id) }))
    .sort((a, b) => b.orderCount - a.orderCount || a.name.localeCompare(b.name))
})

// Ambil dari rows supaya ringkasan di modal ikut berubah bila ada pesanan baru.
const selected = computed(() => rows.value.find((c) => c.id === selectedId.value) ?? null)
const selectedOrders = computed(() => (selectedId.value ? orders.ordersByCustomer(selectedId.value) : []))
</script>

<template>
  <PageHeader title="Data Pelanggan" subtitle="Pelanggan tercatat otomatis dari nomor WhatsApp saat memesan.">
    <SearchBar v-model="search" placeholder="Cari nama / WhatsApp..." />
  </PageHeader>

  <section class="card">
    <CustomerTable :rows="rows" @detail="selectedId = $event.id" />
  </section>

  <CustomerDetail
    :show="Boolean(selected)"
    :customer="selected"
    :orders="selectedOrders"
    @close="selectedId = null"
  />
</template>
