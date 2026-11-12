<script setup>
/**
 * Navigasi samping. Item menu diambil dari config/navigation.js
 * lalu disaring sesuai role pengguna yang login.
 * Props: open (mode mobile). Emits: close.
 */
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { NAVIGATION } from '@/config/navigation'
import { APP_CONFIG } from '@/config/app'
import BrandMark from '@/components/common/BrandMark.vue'

defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const auth = useAuthStore()
const orders = useOrdersStore()
const menuItems = computed(() => NAVIGATION.filter((item) => auth.hasRole(item.roles)))

// Jumlah yang perlu ditindaklanjuti, ditampilkan di samping menu terkait.
const counts = computed(() => ({ 'order-active': orders.pendingOrders.length }))
</script>

<template>
  <div v-if="open" class="sidebar-backdrop" @click="emit('close')" />
  <aside :class="['sidebar', { 'sidebar--open': open }]">
    <div class="sidebar__brand">
      <BrandMark :size="38" />
      <div>
        <p class="sidebar__name">{{ APP_CONFIG.businessName }}</p>
        <p class="sidebar__tagline">{{ APP_CONFIG.tagline }}</p>
      </div>
    </div>
    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in menuItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        <span>{{ item.label }}</span>
        <span
          v-if="counts[item.routeName]"
          class="sidebar__count"
          :aria-label="`${counts[item.routeName]} pesanan online baru`"
        >{{ counts[item.routeName] }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--color-primary);
  color: #e6efe8;
  display: flex;
  flex-direction: column;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: var(--header-height);
  padding: 0 var(--space-5);
}

.sidebar__name {
  font-family: var(--font-display);
  font-weight: var(--font-weight-display);
  font-size: 21px;
  line-height: 1.1;
  color: #fff;
}

.sidebar__tagline {
  font-size: var(--font-size-small);
  color: #b9cdbf;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-4) 0 var(--space-4) var(--space-3);
}

/* Link aktif berwarna sama dengan latar konten, seolah tab yang menyatu ke halaman. */
.sidebar__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 10px var(--space-4);
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  color: #cfdfd4;
  font-weight: var(--font-weight-medium);
  transition: background var(--transition), color var(--transition);
}

.sidebar__link:hover {
  background: var(--color-primary-dark);
  color: #fff;
}

.sidebar__link--active,
.sidebar__link--active:hover {
  background: var(--color-bg);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.sidebar__link:focus-visible {
  box-shadow: inset 0 0 0 2px var(--color-secondary);
}

.sidebar__count {
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-secondary);
  color: var(--color-text);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform var(--transition);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(28, 38, 33, 0.45);
  }
}
</style>
