<script setup>
/**
 * Satu baris di keranjang.
 * Props: line { productId, name, price, qty, maxQty, subtotal }.
 * Emits: update-qty({ productId, qty }), remove(productId).
 */
import { computed } from 'vue'
import QtyStepper from '@/components/common/QtyStepper.vue'
import { formatCurrency } from '@/utils/format'

const props = defineProps({
  line: { type: Object, required: true }
})

const emit = defineEmits(['update-qty', 'remove'])

const qty = computed({
  get: () => props.line.qty,
  set: (value) => emit('update-qty', { productId: props.line.productId, qty: value })
})
</script>

<template>
  <li class="cart-item">
    <div class="cart-item__info">
      <p class="cart-item__name">{{ line.name }}</p>
      <p class="text-muted text-small">{{ formatCurrency(line.price) }} / porsi</p>
    </div>
    <div class="cart-item__stepper">
      <QtyStepper v-model="qty" :min="0" :max="line.maxQty" />
    </div>
    <p class="cart-item__subtotal">{{ formatCurrency(line.subtotal) }}</p>
    <button class="cart-item__remove" type="button" aria-label="Hapus" @click="emit('remove', line.productId)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
    </button>
  </li>
</template>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'info remove'
    'stepper subtotal';
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item__info { grid-area: info; }
.cart-item__stepper { grid-area: stepper; }
.cart-item__subtotal { grid-area: subtotal; align-self: center; text-align: right; font-weight: var(--font-weight-semibold); }
.cart-item__remove { grid-area: remove; }

.cart-item__name {
  font-weight: var(--font-weight-semibold);
}

.cart-item__remove {
  border: none;
  background: none;
  font-size: 20px;
  color: var(--color-text-muted);
  cursor: pointer;
  align-self: start;
}

.cart-item__remove:hover {
  color: var(--color-danger);
}
</style>
