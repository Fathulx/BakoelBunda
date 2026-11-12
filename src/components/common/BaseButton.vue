<script setup>
/**
 * Tombol standar aplikasi.
 * Props: variant, size, type, block, disabled
 * Event klik diteruskan otomatis (native click).
 */
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'success', 'danger', 'ghost'].includes(v)
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition), border-color var(--transition);
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--sm { padding: 6px 12px; font-size: var(--font-size-small); }
.btn--md { padding: 9px 18px; }
.btn--lg { padding: 13px 22px; font-size: var(--font-size-lead); }
.btn--block { width: 100%; }

.btn--primary { background: var(--color-primary); color: #fff; }
.btn--primary:not(:disabled):hover { background: var(--color-primary-dark); }

.btn--secondary { background: var(--color-secondary); color: var(--color-text); }
.btn--secondary:not(:disabled):hover { filter: brightness(0.94); }

.btn--outline { background: var(--color-surface); color: var(--color-text); border-color: var(--color-border); }
.btn--outline { border-color: var(--color-border-strong); }
.btn--outline:not(:disabled):hover { border-color: var(--color-primary); color: var(--color-primary); }

.btn--success { background: var(--color-success); color: #fff; }
.btn--success:not(:disabled):hover { filter: brightness(0.92); }

.btn--danger { background: var(--color-danger); color: #fff; }
.btn--danger:not(:disabled):hover { filter: brightness(0.92); }

.btn--ghost { background: transparent; color: var(--color-text-muted); }
.btn--ghost:not(:disabled):hover { background: var(--color-primary-soft); color: var(--color-primary); }
.btn:not(:disabled):active { transform: translateY(1px); }
</style>
