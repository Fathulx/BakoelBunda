<script setup>
/** Kerangka halaman pembeli (tanpa login): bilah merek, konten, dan tautan masuk untuk staf. */
import { APP_CONFIG } from '@/config/app'
import BrandMark from '@/components/common/BrandMark.vue'
</script>

<template>
  <div class="shop">
    <header class="shop__bar">
      <RouterLink :to="{ name: 'customer-order' }" class="shop__brand">
        <BrandMark :size="36" />
        <span>
          <span class="shop__name">{{ APP_CONFIG.businessName }}</span>
          <span class="shop__tagline">{{ APP_CONFIG.tagline }}</span>
        </span>
      </RouterLink>
    </header>

    <main class="shop__content">
      <RouterView />
    </main>

    <footer class="shop__footer">
      <RouterLink :to="{ name: 'login' }">Masuk untuk staf</RouterLink>
    </footer>
  </div>
</template>

<style scoped>
.shop {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.shop__bar {
  background: var(--color-primary);
  padding: var(--space-3) var(--space-6);
}

.shop__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  border-radius: var(--radius-md);
}

.shop__name {
  display: block;
  font-family: var(--font-display);
  font-weight: var(--font-weight-display);
  font-size: 21px;
  line-height: 1.1;
  color: #fff;
}

.shop__tagline {
  display: block;
  font-size: var(--font-size-small);
  color: #b9cdbf;
}

.shop__content {
  flex: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.shop__footer {
  padding: var(--space-5) var(--space-6) var(--space-8);
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
}

.shop__footer a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (max-width: 640px) {
  .shop__bar,
  .shop__content {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  /* Ruang untuk bilah keranjang yang menempel di bawah layar. */
  .shop__footer {
    padding-bottom: 96px;
  }
}
</style>
