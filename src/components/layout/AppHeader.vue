<script setup>
/** Header atas: judul halaman, info pengguna, dan tombol keluar. Emits: toggle-menu. */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { ROLE_OPTIONS } from '@/config/app'
import { formatLongDate, formatDate } from '@/utils/format'
import { useNow } from '@/composables/useNow'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'

const emit = defineEmits(['toggle-menu'])

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const now = useNow()
const today = computed(() => formatLongDate(now.value))
// Versi pendek untuk layar HP, contoh "12 Nov 2026".
const todayShort = computed(() => formatDate(now.value))

const roleLabel = computed(() => ROLE_OPTIONS.find((r) => r.value === auth.role)?.label ?? '')

function logout() {
  auth.logout()
  toast.success('Anda telah keluar.')
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <div class="header__side">
      <button class="header__menu" type="button" aria-label="Buka menu" @click="emit('toggle-menu')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      <p class="header__title">
        <span class="header__date-long">{{ today }}</span>
        <span class="header__date-short">{{ todayShort }}</span>
      </p>
    </div>
    <div class="header__side header__side--end">
      <div class="header__user">
        <p class="header__name">{{ auth.user?.name }}</p>
        <BaseBadge variant="primary">{{ roleLabel }}</BaseBadge>
      </div>
      <BaseButton variant="outline" size="sm" class="header__logout" @click="logout">Keluar</BaseButton>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

/* Isi header selalu satu baris; teks yang terlalu panjang dipotong dengan "…". */
.header__side {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.header__side--end {
  flex-shrink: 0;
  max-width: 60%;
}

.header__logout {
  flex-shrink: 0;
}

.header__menu {
  display: none;
  flex-shrink: 0;
  padding: 6px;
  border: none;
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-text);
  cursor: pointer;
}

.header__title {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
}

.header__date-short {
  display: none;
}

.header__user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
}

.header__name {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
}

@media (max-width: 900px) {
  .header {
    padding: 0 var(--space-4);
  }

  .header__menu {
    display: grid;
  }
}

@media (max-width: 640px) {
  .header {
    gap: var(--space-2);
  }

  .header__date-long {
    display: none;
  }

  .header__date-short {
    display: inline;
  }

  .header__name {
    display: none;
  }
}

@media (max-width: 400px) {
  .header__user {
    display: none;
  }
}
</style>
