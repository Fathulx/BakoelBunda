<script setup>
/**
 * Input teks/angka dengan label dan pesan error.
 * v-model: nilai input (angka otomatis dikonversi ke Number untuk type="number").
 * Props: label, type, error, hint, required. Atribut lain (placeholder, min, max, dll.)
 * diteruskan ke elemen <input>.
 */
import { useId, useAttrs, computed } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: [String, Number], default: '' })

const props = defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false }
})

const inputId = useId()

// class/style dipasang di pembungkus, atribut lain (placeholder, min, dll.) ke <input>.
const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

function onInput(event) {
  const raw = event.target.value
  model.value = props.type === 'number' ? (raw === '' ? '' : Number(raw)) : raw
}
</script>

<template>
  <div :class="['field', $attrs.class]" :style="$attrs.style">
    <label v-if="label" :for="inputId" class="field__label">
      {{ label }}<span v-if="required" class="field__required">*</span>
    </label>
    <input
      :id="inputId"
      v-bind="inputAttrs"
      :type="type"
      :value="model"
      :class="['field__control', { 'field__control--error': error }]"
      :aria-invalid="Boolean(error)"
      @input="onInput"
    />
    <p v-if="error" class="field__error">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color var(--transition), box-shadow var(--transition);
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

.field__hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}
</style>
