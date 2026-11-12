<script setup>
/**
 * Detail satu pelanggan: ringkasan, menu yang paling sering dipesan, dan riwayat pesanan beserta isinya.
 * Props: show, customer ({ name, phone, createdAt, orderCount, totalSpent }), orders (pesanan pelanggan, terbaru dulu).
 * Emits: close.
 */
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CustomerOrderItem from './CustomerOrderItem.vue'
import { topProducts } from '@/stores/orders'
import { DISPLAY_LIMITS } from '@/config/app'
import { formatCurrency, formatDate, toWhatsAppLink } from '@/utils/format'

const props = defineProps({
  show: { type: Boolean, default: false },
  customer: { type: Object, default: null },
  orders: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const favorites = computed(() => topProducts(props.orders, DISPLAY_LIMITS.customerFavorites))
</script>

<template>
  <BaseModal :show="show && Boolean(customer)" :title="customer?.name ?? ''" width="640px" @close="emit('close')">
    <div v-if="customer" class="detail">
      <dl class="detail__facts">
        <div>
          <dt>WhatsApp</dt>
          <dd>
            <a :href="toWhatsAppLink(customer.phone)" target="_blank" rel="noopener">{{ customer.phone }}</a>
          </dd>
        </div>
        <div>
          <dt>Jumlah pesanan</dt>
          <dd>{{ customer.orderCount }}</dd>
        </div>
        <div>
          <dt>Total belanja</dt>
          <dd>{{ formatCurrency(customer.totalSpent) }}</dd>
        </div>
        <div>
          <dt>Pelanggan sejak</dt>
          <dd>{{ formatDate(customer.createdAt) }}</dd>
        </div>
      </dl>

      <section v-if="favorites.length">
        <h3>Menu yang sering dipesan</h3>
        <ul class="detail__favorites">
          <li v-for="item in favorites" :key="item.productId">
            <span>{{ item.name }}</span>
            <strong>{{ item.qty }} porsi</strong>
          </li>
        </ul>
      </section>

      <section>
        <h3>Riwayat pesanan ({{ orders.length }})</h3>
        <p v-if="!orders.length" class="text-muted">Belum ada pesanan.</p>
        <ul v-else class="detail__orders">
          <CustomerOrderItem v-for="order in orders" :key="order.id" :order="order" />
        </ul>
      </section>
    </div>
    <template #footer>
      <BaseButton @click="emit('close')">Tutup</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.detail h3 {
  margin-bottom: var(--space-2);
}

.detail__facts {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--space-3);
}

.detail__facts dt {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}

.detail__facts dd {
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.detail__facts a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.detail__favorites,
.detail__orders {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail__favorites li {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
}
</style>
