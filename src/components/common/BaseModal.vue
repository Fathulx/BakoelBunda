<script setup>
/**
 * Jendela modal.
 * Props: show, title, width. Emits: close (klik latar, tombol tutup, atau tombol Esc).
 * Slot: default (isi), footer (tombol aksi).
 */
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '520px' }
})

const emit = defineEmits(['close'])

const onKeydown = (event) => {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.show,
  (visible) => {
    if (visible) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal" @click.self="emit('close')">
        <div class="modal__panel" :style="{ maxWidth: width }" role="dialog" aria-modal="true">
          <header class="modal__header">
            <h2>{{ title }}</h2>
            <button class="modal__close" type="button" aria-label="Tutup" @click="emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
            </button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(28, 38, 33, 0.5);
}

.modal__panel {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.modal__close {
  display: grid;
  place-items: center;
  padding: 6px;
  border: none;
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.modal__body {
  padding: var(--space-5);
  overflow-y: auto;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
