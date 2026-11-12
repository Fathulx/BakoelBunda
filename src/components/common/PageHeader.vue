<script setup>
/** Judul halaman. Props: title, subtitle. Slot: tombol aksi di kanan. */
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="text-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="row">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
</style>
