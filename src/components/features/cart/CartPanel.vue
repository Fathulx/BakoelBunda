<script setup>
/**
 * Panel keranjang belanja.
 * Props: lines, total, totalQty, error. Emits: update-qty, remove, clear.
 */
import CartItem from './CartItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/utils/format'

defineProps({
  lines: { type: Array, required: true },
  total: { type: Number, required: true },
  totalQty: { type: Number, required: true },
  error: { type: String, default: '' }
})

const emit = defineEmits(['update-qty', 'remove', 'clear'])
</script>

<template>
  <section class="cart card">
    <header class="cart__header">
      <h2>Keranjang <span class="text-muted">({{ totalQty }} porsi)</span></h2>
      <BaseButton v-if="lines.length" size="sm" variant="ghost" @click="emit('clear')">Kosongkan</BaseButton>
    </header>

    <EmptyState
      v-if="!lines.length"
      title="Keranjang kosong"
      description="Tekan Tambah pada menu untuk memulai pesanan."
    />
    <ul v-else class="cart__list">
      <CartItem
        v-for="line in lines"
        :key="line.productId"
        :line="line"
        @update-qty="emit('update-qty', $event)"
        @remove="emit('remove', $event)"
      />
    </ul>

    <p v-if="error" class="text-danger text-small">{{ error }}</p>

    <div class="cart__total">
      <span>Total</span>
      <strong>{{ formatCurrency(total) }}</strong>
    </div>
  </section>
</template>

<style scoped>
.cart {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.cart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cart__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-top: 2px dashed var(--color-border-strong);
  font-size: var(--font-size-lead);
  font-weight: var(--font-weight-semibold);
}

.cart__total strong {
  font-family: var(--font-display);
  font-weight: var(--font-weight-display);
  font-size: 28px;
  color: var(--color-chili);
}
</style>
