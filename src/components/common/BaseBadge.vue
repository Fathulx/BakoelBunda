<script setup>
/** Label status kecil. Props: variant (neutral|primary|success|warning|danger|info). */
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'primary', 'success', 'warning', 'danger', 'info'].includes(v)
  }
})
</script>

<template>
  <span :class="['badge', `badge--${variant}`]"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.badge--neutral { background: var(--color-bg); color: var(--color-text-muted); box-shadow: inset 0 0 0 1px var(--color-border); }
.badge--primary { background: var(--color-primary-soft); color: var(--color-primary); }
.badge--success { background: var(--color-success-soft); color: var(--color-success); }
.badge--warning { background: var(--color-warning-soft); color: var(--color-warning-text); }
.badge--danger { background: var(--color-danger-soft); color: var(--color-danger); }
.badge--info { background: var(--color-info-soft); color: var(--color-info); }
</style>
