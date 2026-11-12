<script setup>
/** Menampilkan notifikasi dari toast store di pojok kanan bawah. */
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="item in toast.toasts"
        :key="item.id"
        :class="['toast', `toast--${item.type}`]"
        @click="toast.remove(item.id)"
      >
        {{ item.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 360px;
}

.toast {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: #fff;
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.toast--success { background: var(--color-success); }
.toast--danger { background: var(--color-danger); }
.toast--warning { background: var(--color-warning); color: var(--color-text); }

.toast-enter-active,
.toast-leave-active {
  transition: all 200ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
