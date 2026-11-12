<script setup>
/**
 * Kartu satu menu (dipakai di Katalog dan halaman pemesanan).
 * Props: product, selectable (tampilkan tombol tambah), qtyInCart.
 * Emits: add(productId).
 */
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import StockIndicator from './StockIndicator.vue'
import { formatCurrency } from '@/utils/format'

const props = defineProps({
  product: { type: Object, required: true },
  selectable: { type: Boolean, default: false },
  qtyInCart: { type: Number, default: 0 }
})

const emit = defineEmits(['add'])

const remaining = computed(() => props.product.stock - props.qtyInCart)
const canAdd = computed(() => props.product.isActive && remaining.value > 0)
</script>

<template>
  <article :class="['menu-card', { 'menu-card--disabled': !canAdd && selectable }]">
    <div class="menu-card__head">
      <h3>{{ product.name }}</h3>
      <p class="menu-card__desc">{{ product.description }}</p>
    </div>
    <div class="menu-card__price-row">
      <span class="menu-card__price figure">{{ formatCurrency(product.price) }}</span>
      <span class="menu-card__portion">isi {{ product.portionPcs }} pcs</span>
    </div>
    <div class="menu-card__footer">
      <StockIndicator :stock="product.stock" :min-stock="product.minStock" />
      <span v-if="qtyInCart" class="menu-card__incart">{{ qtyInCart }} di keranjang</span>
    </div>
    <BaseButton
      v-if="selectable"
      block
      :disabled="!canAdd"
      @click="emit('add', product.id)"
    >
      {{ canAdd ? 'Tambah' : 'Stok habis' }}
    </BaseButton>
  </article>
</template>

<style scoped>
.menu-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--color-secondary);
  border-radius: var(--radius-lg);
}

.menu-card--disabled {
  border-top-color: var(--color-border-strong);
  background: transparent;
}

.menu-card--disabled .menu-card__price {
  color: var(--color-text-muted);
}

.menu-card__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.menu-card__desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}

.menu-card__price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: auto;
}

.menu-card__price {
  font-size: 24px;
  color: var(--color-chili);
}

.menu-card__portion {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}

.menu-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.menu-card__incart {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
</style>
