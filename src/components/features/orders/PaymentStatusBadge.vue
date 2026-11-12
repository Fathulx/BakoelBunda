<script setup>
/** Badge status bayar pesanan. Props: status. Label dan warna diambil dari config. */
import { computed } from 'vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import { PAYMENT_STATUS_OPTIONS } from '@/config/app'

const props = defineProps({
  status: { type: String, required: true }
})

const meta = computed(
  () => PAYMENT_STATUS_OPTIONS.find((s) => s.value === props.status) ?? { label: props.status, variant: 'neutral' }
)
</script>

<template>
  <BaseBadge :variant="meta.variant">{{ meta.label }}</BaseBadge>
</template>
