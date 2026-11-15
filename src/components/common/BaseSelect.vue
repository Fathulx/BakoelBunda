<script setup>
/**
 * Dropdown pilihan.
 * v-model: nilai terpilih.
 * Props: label, options [{ value, label }], placeholder, error, required.
 */
import { useId } from 'vue'

const model = defineModel({ type: [String, Number], default: '' })

defineProps({
  label: { type: String, default: '' },
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false }
})

const selectId = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="selectId" class="field__label">
      {{ label }}<span v-if="required" class="field__required">*</span>
    </label>
    <select
      :id="selectId"
      v-model="model"
      :class="['field__control', { 'field__control--error': error }]"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field__label {
  font-weight: var(--font-weight-medium);
}

.field__required {
  color: var(--color-danger);
  margin-left: 2px;
}

.field__control {
  padding: 9px 12px;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.field__control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.field__control--error {
  border-color: var(--color-danger);
}

.field__error {
  color: var(--color-danger);
  font-size: var(--font-size-small);
}
</style>
