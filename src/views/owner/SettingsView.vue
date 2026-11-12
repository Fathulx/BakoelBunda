<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'
import PageHeader from '@/components/common/PageHeader.vue'
import SettingsForm from '@/components/features/settings/SettingsForm.vue'

const settings = useSettingsStore()
const toast = useToastStore()

const copyCurrent = () => ({ ...settings.data })
const form = ref(copyCurrent())
const errors = ref({})

function save() {
  const result = settings.updateSettings(form.value)
  if (!result.ok) {
    errors.value = result.errors
    toast.error(Object.values(result.errors)[0])
    return
  }
  errors.value = {}
  form.value = copyCurrent()
  toast.success('Pengaturan toko disimpan.')
}

function reset() {
  form.value = copyCurrent()
  errors.value = {}
}
</script>

<template>
  <PageHeader
    title="Pengaturan Toko"
    subtitle="Jam pemesanan, jam antar/ambil, alamat pengambilan, dan rekening untuk pembayaran di muka."
  />
  <SettingsForm v-model="form" :errors="errors" @submit="save" @reset="reset" />
</template>
