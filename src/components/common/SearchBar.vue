<script setup>
/** Kotak pencarian. v-model: kata kunci. Props: placeholder. */
const model = defineModel({ type: String, default: '' })

defineProps({
  placeholder: { type: String, default: 'Cari...' }
})
</script>

<template>
  <div class="search">
    <svg class="search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><line x1="16" y1="16" x2="20" y2="20" /></svg>
    <input v-model="model" type="search" class="search__input" :placeholder="placeholder" />
  </div>
</template>

<style scoped>
.search {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.search__icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search__input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.search__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
</style>
