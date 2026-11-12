<script setup>
/**
 * Dialog konfirmasi sebelum aksi penting (hapus, batal).
 * Props: show, title, message, confirmText, variant. Emits: confirm, cancel.
 */
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Ya, lanjutkan' },
  variant: { type: String, default: 'danger' }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :show="show" :title="title" width="420px" @close="emit('cancel')">
    <p>{{ message }}</p>
    <template #footer>
      <BaseButton variant="outline" @click="emit('cancel')">Batal</BaseButton>
      <BaseButton :variant="variant" @click="emit('confirm')">{{ confirmText }}</BaseButton>
    </template>
  </BaseModal>
</template>
