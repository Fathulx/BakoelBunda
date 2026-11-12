<script setup>
/** Tampilan saat data kosong. Props: title, description. Slot: tombol aksi. */
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <h3>{{ title }}</h3>
    <p v-if="description" class="text-muted">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  color: var(--color-text);
}

.empty p {
  max-width: 52ch;
}
</style>
