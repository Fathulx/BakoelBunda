<script setup>
/**
 * Form tambah/ubah pengguna.
 * Props: show, user (null = tambah), errors. Emits: close, submit(formData).
 */
import { reactive, watch, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { ROLE_OPTIONS, VALIDATION_LIMITS } from '@/config/app'

const props = defineProps({
  show: { type: Boolean, default: false },
  user: { type: Object, default: null },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'submit'])

const emptyForm = () => ({ name: '', username: '', password: '', role: '' })
const form = reactive(emptyForm())
const isEdit = computed(() => Boolean(props.user))

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    Object.assign(form, emptyForm())
    if (props.user) {
      Object.assign(form, { name: props.user.name, username: props.user.username, role: props.user.role })
    }
  }
)

const submit = () => emit('submit', { ...form })
</script>

<template>
  <BaseModal :show="show" :title="isEdit ? 'Ubah Pengguna' : 'Tambah Pengguna'" @close="emit('close')">
    <form id="user-form" class="stack" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="form.name"
        label="Nama Lengkap"
        placeholder="Contoh: Rina"
        :maxlength="VALIDATION_LIMITS.personName.max"
        :error="errors.name"
        required
      />
      <BaseInput
        v-model="form.username"
        label="Username"
        placeholder="huruf kecil, angka, _"
        autocomplete="off"
        :maxlength="VALIDATION_LIMITS.username.max"
        :error="errors.username"
        required
      />
      <BaseInput
        v-model="form.password"
        type="password"
        label="Kata Sandi"
        autocomplete="new-password"
        :hint="isEdit ? 'Kosongkan jika tidak ingin mengubah kata sandi.' : `Minimal ${VALIDATION_LIMITS.password.min} karakter.`"
        :error="errors.password"
        :required="!isEdit"
      />
      <BaseSelect
        v-model="form.role"
        label="Role"
        :options="ROLE_OPTIONS"
        placeholder="Pilih role"
        :error="errors.role"
        required
      />
      <p v-if="errors.general" class="text-danger">{{ errors.general }}</p>
    </form>
    <template #footer>
      <BaseButton variant="outline" @click="emit('close')">Batal</BaseButton>
      <BaseButton type="submit" form="user-form">Simpan</BaseButton>
    </template>
  </BaseModal>
</template>
