<script setup>
/** Pengatur jumlah (− angka +). v-model: jumlah. Props: min, max. */
const model = defineModel({ type: Number, required: true })

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 }
})

const decrease = () => (model.value = Math.max(props.min, model.value - 1))
const increase = () => (model.value = Math.min(props.max, model.value + 1))
</script>

<template>
  <div class="stepper">
    <button type="button" class="stepper__btn" aria-label="Kurangi" @click="decrease">−</button>
    <span class="stepper__value">{{ model }}</span>
    <button
      type="button"
      class="stepper__btn"
      aria-label="Tambah"
      :disabled="model >= max"
      @click="increase"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.stepper__btn {
  width: 30px;
  height: 30px;
  border: none;
  background: var(--color-bg);
  font-size: 16px;
  cursor: pointer;
}

.stepper__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper__value {
  min-width: 34px;
  text-align: center;
  font-weight: var(--font-weight-semibold);
}
</style>
