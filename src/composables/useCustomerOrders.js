import { ref, computed } from 'vue'
import { readStorage, writeStorage } from '@/services/storage'
import { useOrdersStore } from '@/stores/orders'
import { ORDER_STATUS } from '@/config/app'

const STORAGE_KEY = 'customer_order_ids'
const FINISHED = [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]

/** Daftar pesanan yang dikirim dari browser ini, supaya pembeli bisa membuka statusnya lagi. */
export function useCustomerOrders() {
  const orders = useOrdersStore()
  const ids = ref(readStorage(STORAGE_KEY, []))

  function remember(orderId) {
    ids.value = [orderId, ...ids.value.filter((id) => id !== orderId)]
    writeStorage(STORAGE_KEY, ids.value)
  }

  const myOrders = computed(() => ids.value.map((id) => orders.getById(id)).filter(Boolean))
  const activeOrders = computed(() => myOrders.value.filter((o) => !FINISHED.includes(o.status)))

  return { myOrders, activeOrders, remember }
}
