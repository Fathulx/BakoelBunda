<script setup>
/**
 * Ikon garis sederhana (SVG, 24×24) tanpa library tambahan.
 * Props: name (kunci di ICONS), size (px). Warna mengikuti warna teks (currentColor).
 */
import { computed } from 'vue'

const ICONS = {
  dashboard: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
  menu: 'M4 3v8a3 3 0 0 0 6 0V3 M7 3v18 M17 3c-2 2-3 5-3 8h3v10',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  reports: 'M3 3v18h18 M8 17v-5 M13 17V8 M18 17v-9',
  customers: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M20 21a8 8 0 0 0-16 0',
  settings: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  orders:
    'M9 2h6v4H9z M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3 M9 12h6 M9 16h6',
  history: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  kitchen:
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  catalog: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 }
})

const path = computed(() => ICONS[props.name] ?? '')
</script>

<template>
  <svg
    v-if="path"
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="path" />
  </svg>
</template>

<style scoped>
.icon {
  flex-shrink: 0;
}
</style>
