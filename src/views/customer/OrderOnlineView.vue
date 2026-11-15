<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'
import { useCustomerOrders } from '@/composables/useCustomerOrders'
import { ORDER_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS, ORDER_STATUS_OPTIONS } from '@/config/app'
import { formatCurrency } from '@/utils/format'
import { earliestDeliveryDate, latestDeliveryDate, isPastCutoff, formatDeliveryDate } from '@/utils/orderDates'
import { useNow } from '@/composables/useNow'
import { loadCustomerProfile, saveCustomerProfile, clearCustomerProfile } from '@/composables/useCustomerProfile'
import EmptyState from '@/components/common/EmptyState.vue'
import MenuCard from '@/components/features/products/MenuCard.vue'
import CartPanel from '@/components/features/cart/CartPanel.vue'
import CustomerCheckoutForm from '@/components/features/customer/CustomerCheckoutForm.vue'

const router = useRouter()
const products = useProductsStore()
const cart = useCartStore()
const orders = useOrdersStore()
const toast = useToastStore()
const settings = useSettingsStore()
const now = useNow()
const { activeOrders, remember } = useCustomerOrders()

const minDate = computed(() => earliestDeliveryDate(new Date(now.value)))
const maxDate = computed(() => latestDeliveryDate(new Date(now.value), settings.data))
const pastCutoff = computed(() => isPastCutoff(new Date(now.value), settings.data.orderCutoffTime))

const emptyCheckout = () => ({
  customerName: '',
  customerPhone: '',
  orderType: ORDER_TYPE_OPTIONS[0].value,
  address: '',
  deliveryDate: minDate.value,
  note: '',
  paymentMethod: PAYMENT_METHOD_OPTIONS[0].value
})

// Pelanggan langganan: data dari pesanan terakhir di browser ini langsung terisi.
const savedProfile = loadCustomerProfile()
const checkout = reactive({ ...emptyCheckout(), ...savedProfile })
const usingSavedProfile = ref(Boolean(savedProfile.customerName))

function forgetProfile() {
  clearCustomerProfile()
  Object.assign(checkout, emptyCheckout())
  usingSavedProfile.value = false
}
// Jika halaman dibiarkan terbuka melewati tengah malam, tanggal yang dipilih ikut maju.
watch(minDate, (min) => {
  if (checkout.deliveryDate < min) checkout.deliveryDate = min
})

const errors = ref({})
const cartPanel = ref(null)

const statusLabel = (status) => ORDER_STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status

function addToCart(productId) {
  const error = cart.addItem(productId)
  if (error) toast.warning(error)
  else if (errors.value.cart) errors.value = { ...errors.value, cart: '' }
}

function scrollToCart() {
  cartPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function submitOrder() {
  const result = orders.createOrder({ lines: cart.lines, ...checkout })
  if (!result.ok) {
    errors.value = result.errors
    toast.error(Object.values(result.errors)[0])
    return
  }

  errors.value = {}
  cart.clear()
  remember(result.order.id)
  saveCustomerProfile(checkout)
  router.push({ name: 'customer-order-status', params: { id: result.order.id } })
}
</script>

<template>
  <div class="intro">
    <h1>Pesan dimsum ayam</h1>
    <p class="text-muted">
      Sistem pre-order: dimsum dibuat setelah dipesan. Pesan paling cepat untuk besok,
      {{ formatDeliveryDate(minDate) }}.
    </p>
    <p v-if="pastCutoff" class="intro__notice">
      Pesanan setelah pukul {{ settings.data.orderCutoffTime }} tetap dikirim besok, sesuai urutan antrean.
    </p>
  </div>

  <RouterLink
    v-for="order in activeOrders"
    :key="order.id"
    :to="{ name: 'customer-order-status', params: { id: order.id } }"
    class="ongoing"
  >
    <span>Pesanan #{{ order.queueNo }} untuk {{ formatDeliveryDate(order.deliveryDate) }}: {{ statusLabel(order.status).toLowerCase() }}</span>
    <span class="ongoing__link">Lihat status</span>
  </RouterLink>

  <div class="order">
    <section class="order__menu" aria-label="Daftar menu">
      <EmptyState
        v-if="!products.activeProducts.length"
        title="Menu belum tersedia"
        description="Dapur sedang menyiapkan stok. Coba buka lagi nanti."
      />
      <div v-else class="menu-grid">
        <MenuCard
          v-for="product in products.activeProducts"
          :key="product.id"
          :product="product"
          :qty-in-cart="cart.qtyByProduct[product.id] ?? 0"
          selectable
          @add="addToCart"
        />
      </div>
    </section>

    <aside ref="cartPanel" class="order__cart">
      <CartPanel
        :lines="cart.lines"
        :total="cart.total"
        :total-qty="cart.totalQty"
        :error="errors.cart"
        @update-qty="cart.setQty($event.productId, $event.qty)"
        @remove="cart.removeItem"
        @clear="cart.clear"
      />
    </aside>

    <section class="order__form card" aria-labelledby="checkout-title">
      <h2 id="checkout-title">Data pemesanan</h2>
      <p v-if="usingSavedProfile" class="saved-profile text-small">
        Data diisi dari pesanan terakhir Anda.
        <button type="button" class="saved-profile__clear" @click="forgetProfile">Bukan Anda? Kosongkan</button>
      </p>
      <CustomerCheckoutForm
        v-model="checkout"
        :total="cart.total"
        :errors="errors"
        :min-date="minDate"
        :max-date="maxDate"
        :settings="settings.data"
        @submit="submitOrder"
      />
    </section>
  </div>

  <button v-if="cart.totalQty" type="button" class="cart-bar" @click="scrollToCart">
    <span>{{ cart.totalQty }} porsi, {{ formatCurrency(cart.total) }}</span>
    <span class="cart-bar__action">Lihat keranjang</span>
  </button>
</template>

<style scoped>
.intro__notice {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-warning-soft);
  font-size: var(--font-size-small);
}

.intro h1 {
  font-size: var(--font-size-display);
}

.ongoing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.ongoing__link {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Desktop: menu dan form di kiri, keranjang ringkas menempel di kanan. HP: menu → keranjang → form. */
.order {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  grid-template-areas:
    'menu cart'
    'form cart';
  gap: var(--space-5);
  align-items: start;
}

.saved-profile {
  color: var(--color-text-muted);
}

.saved-profile__clear {
  padding: 0;
  border: none;
  background: none;
  color: var(--color-primary);
  font: inherit;
  font-weight: var(--font-weight-semibold);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.order__menu {
  grid-area: menu;
}

.order__form {
  grid-area: form;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: var(--space-4);
}

.order__cart {
  grid-area: cart;
  position: sticky;
  top: var(--space-4);
  scroll-margin-top: var(--space-4);
}

.cart-bar {
  display: none;
}

@media (max-width: 960px) {
  .order {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'menu'
      'cart'
      'form';
  }

  .order__cart {
    position: static;
  }

  /* Di layar kecil keranjang ada di bawah menu; bilah ini membawa pembeli ke sana. */
  .cart-bar {
    position: fixed;
    left: var(--space-4);
    right: var(--space-4);
    bottom: var(--space-4);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: none;
    border-radius: var(--radius-lg);
    background: var(--color-primary);
    color: #fff;
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-md);
    cursor: pointer;
  }

  .cart-bar__action {
    color: #f3e9d3;
  }
}
</style>
