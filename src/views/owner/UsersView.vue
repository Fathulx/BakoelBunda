<script setup>
import { ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useFormModal } from '@/composables/useFormModal'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import UserTable from '@/components/features/users/UserTable.vue'
import UserForm from '@/components/features/users/UserForm.vue'

const users = useUsersStore()
const auth = useAuthStore()
const toast = useToastStore()
const modal = useFormModal()

const toDelete = ref(null)

function save(formData) {
  const result = modal.isEdit.value
    ? users.updateUser(modal.editing.value.id, formData)
    : users.addUser(formData)

  if (!result.ok) {
    modal.errors.value = result.errors
    toast.error('Periksa kembali isian form.')
    return
  }

  auth.syncSession()
  toast.success(modal.isEdit.value ? 'Data pengguna diperbarui.' : 'Pengguna baru ditambahkan.')
  modal.close()
}

function toggle(user) {
  const result = users.toggleActive(user.id, auth.user.id)
  result.ok ? toast.success(result.message) : toast.error(result.message)
}

function confirmDelete() {
  const result = users.removeUser(toDelete.value.id, auth.user.id)
  result.ok ? toast.success(result.message) : toast.error(result.message)
  toDelete.value = null
}
</script>

<template>
  <PageHeader title="Kelola Pengguna" subtitle="Atur akun Owner, Admin, dan Dapur.">
    <BaseButton @click="modal.openCreate()">+ Tambah Pengguna</BaseButton>
  </PageHeader>

  <section class="card">
    <UserTable
      :users="users.sorted"
      :current-user-id="auth.user?.id"
      @edit="modal.openEdit"
      @delete="toDelete = $event"
      @toggle="toggle"
    />
  </section>

  <UserForm
    :show="modal.show.value"
    :user="modal.editing.value"
    :errors="modal.errors.value"
    @close="modal.close"
    @submit="save"
  />
  <ConfirmDialog
    :show="Boolean(toDelete)"
    title="Hapus Pengguna"
    :message="`Yakin menghapus akun “${toDelete?.name}”?`"
    confirm-text="Hapus"
    @confirm="confirmDelete"
    @cancel="toDelete = null"
  />
</template>
