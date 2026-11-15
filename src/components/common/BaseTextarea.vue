<script setup>
/**
 * Area teks multi-baris.
 * v-model: isi teks. Props: label, rows, maxlength, error, placeholder.
 */
import { useId } from 'vue'

const model = defineModel({ type: String, default: '' })

defineProps({
  label: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: null },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' }
})

const textareaId = useId()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="textareaId" class="field__label">{{ label }}</label>
    <textarea
      :id="textareaId"
      v-model="model"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :class="['field__control', { 'field__control--error': error }]"
    />
    <div class="field__footer">
      <p v-if="error" class="field__error">{{ error }}</p>
      <span v-if="maxlength" class="field__count">{{ model.length }}/{{ maxlength }}</span>
    </div>
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

.field__control {
  padding: 9px 12px;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-md);
  resize: vertical;
}

.field__control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.field__control--error {
  border-color: var(--color-danger);
}

.field__footer {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-small);
}

.field__error {
  color: var(--color-danger);
}

.field__count {
  margin-left: auto;
  color: var(--color-text-muted);
}
</style>
