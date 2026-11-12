<script setup>
/**
 * Langkah status pesanan untuk pembeli (dikirim → diproses → siap → selesai).
 * Props: order.
 */
import { computed } from 'vue'
import { ORDER_STATUS, ORDER_TYPE } from '@/config/app'

const props = defineProps({
  order: { type: Object, required: true }
})

const STEP_ORDER = [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.READY, ORDER_STATUS.COMPLETED]

const steps = computed(() => {
  const delivery = props.order.orderType === ORDER_TYPE.DELIVERY
  return [
    { status: ORDER_STATUS.PENDING, title: 'Pesanan dikirim' },
    { status: ORDER_STATUS.PROCESSING, title: 'Diterima, masuk jadwal produksi' },
    { status: ORDER_STATUS.READY, title: delivery ? 'Siap diantar' : 'Siap diambil' },
    { status: ORDER_STATUS.COMPLETED, title: delivery ? 'Sudah diantar' : 'Sudah diambil' }
  ]
})

const currentIndex = computed(() => STEP_ORDER.indexOf(props.order.status))
const stepState = (index) => {
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return 'current'
  return 'next'
}
</script>

<template>
  <ol class="steps">
    <li v-for="(step, index) in steps" :key="step.status" :class="['steps__item', `steps__item--${stepState(index)}`]">
      <span class="steps__marker" aria-hidden="true">{{ index + 1 }}</span>
      <span>{{ step.title }}</span>
    </li>
  </ol>
</template>

<style scoped>
/* Langkah pesanan berurutan, jadi diberi nomor. */
.steps {
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.steps__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  color: var(--color-text-muted);
}

.steps__item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: calc(50% + 16px);
  height: calc(100% - 32px);
  width: 2px;
  background: var(--color-border-strong);
}

.steps__marker {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  background: var(--color-surface);
  font-weight: var(--font-weight-bold);
}

.steps__item--done {
  color: var(--color-text);
}

.steps__item--done .steps__marker {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.steps__item--done:not(:last-child)::after {
  background: var(--color-primary);
}

.steps__item--current {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.steps__item--current .steps__marker {
  border-color: var(--color-secondary);
  background: var(--color-secondary);
  color: var(--color-text);
}
</style>
