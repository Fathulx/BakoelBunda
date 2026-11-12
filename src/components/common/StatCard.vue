<script setup>
/** Kartu angka ringkasan. Props: label, value, hint, variant (warna garis kiri). */
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  variant: { type: String, default: 'primary' }
})
</script>

<template>
  <div :class="['stat', 'card', `stat--${variant}`]">
    <p class="stat__label">{{ label }}</p>
    <p class="stat__value figure">{{ value }}</p>
    <p v-if="hint" class="stat__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-left-width: 4px;
  border-left-color: var(--stat-accent, var(--color-primary));
}

.stat--primary { --stat-accent: var(--color-primary); }
.stat--secondary { --stat-accent: var(--color-secondary); }
.stat--success { --stat-accent: var(--color-success); }
.stat--warning { --stat-accent: var(--color-warning); }
.stat--danger { --stat-accent: var(--color-danger); }
.stat--info { --stat-accent: var(--color-info); }

.stat__label {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.stat__value {
  font-size: 28px;
  color: var(--color-text);
}

.stat__hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
}
</style>
