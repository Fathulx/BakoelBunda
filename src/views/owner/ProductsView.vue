<script setup>
import { ref, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useToastStore } from '@/stores/toast'
import { useFormModal } from '@/composables/useFormModal'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ProductTable from '@/components/features/products/ProductTable.vue'
import ProductForm from '@/components/features/products/ProductForm.vue'

const products = useProductsStore()
const toast = useToastStore()
const modal = useFormModal()

const search = ref('')
const toDelete = ref(null)

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return products.sorted.filter((p) => p.name.toLowerCase().includes(keyword))
})

function save(formData) {
  const result = modal.isEdit.value
    ? products.updateProduct(modal.editing.value.id, formData)
    : products.addProduct(formData)

  if (!result.ok) {
    modal.errors.value = result.errors
    toast.error('Periksa kembali isian form.')
    return
  }

  toast.success(modal.isEdit.value ? 'Menu berhasil diperbarui.' : 'Menu baru berhasil ditambahkan.')
  modal.close()
}

function toggle(product) {
  products.toggleActive(product.id)
  toast.success(`"${product.name}" ${product.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`)
}

function confirmDelete() {
  const result = products.removeProduct(toDelete.value.id)
  result.ok ? toast.success(result.message) : toast.error(result.message)
  toDelete.value = null
}
</script>

<template>
  <PageHeader title="Kelola Menu" subtitle="Atur menu, harga, dan stok harian dimsum.">
    <BaseButton @click="modal.openCreate()">+ Tambah Menu</BaseButton>
  </PageHeader>

  <section class="card stack">
    <SearchBar v-model="search" placeholder="Cari nama menu..." />
    <ProductTable
      :products="filtered"
      @edit="modal.openEdit"
      @delete="toDelete = $event"
      @toggle="toggle"
    />
  </section>

  <ProductForm
    :show="modal.show.value"
    :product="modal.editing.value"
    :errors="modal.errors.value"
    @close="modal.close"
    @submit="save"
  />
  <ConfirmDialog
    :show="Boolean(toDelete)"
    title="Hapus Menu"
    :message="`Yakin menghapus menu “${toDelete?.name}”? Tindakan ini tidak bisa dibatalkan.`"
    confirm-text="Hapus"
    @confirm="confirmDelete"
    @cancel="toDelete = null"
  />
</template>
