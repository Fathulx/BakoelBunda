<script setup>
/** Badge stok: Habis / Menipis / Tersedia. Props: stock, minStock. */
import { computed } from 'vue'
import BaseBadge from '@/components/common/BaseBadge.vue'

const props = defineProps({
  stock: { type: Number, required: true },
  minStock: { type: Number, required: true }
})

const state = computed(() => {
  if (props.stock <= 0) return { variant: 'danger', label: 'Habis' }
  if (props.stock <= props.minStock) return { variant: 'warning', label: `Sisa ${props.stock}, menipis` }
  return { variant: 'success', label: `Stok ${props.stock}` }
})
</script>

<template>
  <BaseBadge :variant="state.variant">{{ state.label }}</BaseBadge>
</template>
