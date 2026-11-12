<script setup>
/** Logo Bakoel Bunda: tutup kukusan bambu dilihat dari atas. Props: size (px). */
defineProps({
  size: { type: Number, default: 40 }
})
</script>

<template>
  <svg
    class="brand-mark"
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="24" cy="24" r="22" fill="#c99a4b" />
    <circle cx="24" cy="24" r="17" fill="#e2bf7e" stroke="#8f6a2c" stroke-width="1.5" />
    <g stroke="#a67c38" stroke-width="1.5" stroke-linecap="round">
      <line x1="12" y1="18" x2="36" y2="18" />
      <line x1="8.5" y1="24" x2="39.5" y2="24" />
      <line x1="12" y1="30" x2="36" y2="30" />
    </g>
    <circle cx="24" cy="24" r="3.5" fill="#1e5a3c" />
  </svg>
</template>

<style scoped>
.brand-mark {
  display: block;
  flex-shrink: 0;
}
</style>
