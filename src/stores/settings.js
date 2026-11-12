import { ref, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import settingsSeed from '@/seed/settings.json'
import { loadWithSeed, writeStorage, subscribeStorage } from '@/services/storage'
import { validateSettings, hasErrors } from '@/utils/validators'

const STORAGE_KEY = 'settings'

/** Pengaturan Toko: satu objek, diubah Owner lewat halaman Pengaturan Toko. */
export const useSettingsStore = defineStore('settings', () => {
  const data = ref(loadWithSeed(STORAGE_KEY, settingsSeed))

  watch(data, (value) => writeStorage(STORAGE_KEY, value), { deep: true })
  subscribeStorage(STORAGE_KEY, (value) => (data.value = value))

  function updateSettings(payload) {
    const errors = validateSettings(payload)
    if (hasErrors(errors)) return { ok: false, errors }

    data.value = {
      businessWhatsApp: String(payload.businessWhatsApp).replace(/[\s-]/g, ''),
      pickupAddress: String(payload.pickupAddress).trim(),
      orderCutoffTime: String(payload.orderCutoffTime).trim(),
      maxDaysAhead: Number(payload.maxDaysAhead),
      handoverStart: String(payload.handoverStart).trim(),
      handoverEnd: String(payload.handoverEnd).trim(),
      bankName: String(payload.bankName).trim(),
      bankAccountNo: String(payload.bankAccountNo).replace(/[\s-]/g, ''),
      bankAccountName: String(payload.bankAccountName).trim()
    }
    return { ok: true }
  }

  return { data, updateSettings }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
