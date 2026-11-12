<script setup>
/**
 * Form tambah/ubah menu (di dalam modal).
 * Props: show, product (null = tambah baru), errors (dari store).
 * Emits: close, submit(formData).
 * Validasi dilakukan di store; form hanya menampilkan pesan error-nya.
 */
import { reactive, watch, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { VALIDATION_LIMITS } from '@/config/app'

const props = defineProps({
  show: { type: Boolean, default: false },
  product: { type: Object, default: null },
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'submit'])

const emptyForm = () => ({
  name: '',
  description: '',
  price: '',
  portionPcs: '',
  stock: '',
  minStock: '',
  isActive: true
})

const form = reactive(emptyForm())
const title = computed(() => (props.product ? 'Ubah Menu' : 'Tambah Menu Baru'))

// Isi ulang form setiap modal dibuka.
watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    Object.assign(form, emptyForm(), props.product ? { ...props.product } : {})
  }
)

const submit = () => emit('submit', { ...form })
</script>

<template>
  <BaseModal :show="show" :title="title" width="600px" @close="emit('close')">
    <form id="product-form" class="form-grid" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="form.name"
        class="span-2"
        label="Nama Menu"
        placeholder="Contoh: Dimsum Ayam Saus Biasa"
        :maxlength="VALIDATION_LIMITS.productName.max"
        :error="errors.name"
        required
      />
      <BaseTextarea
        v-model="form.description"
        class="span-2"
        label="Deskripsi"
        placeholder="Keterangan singkat menu"
        :maxlength="VALIDATION_LIMITS.description.max"
        :error="errors.description"
      />
      <BaseInput
        v-model="form.price"
        type="number"
        label="Harga per Porsi (Rp)"
        placeholder="18000"
        min="1"
        :error="errors.price"
        required
      />
      <BaseInput
        v-model="form.portionPcs"
        type="number"
        label="Isi per Porsi (pcs)"
        placeholder="5"
        min="1"
        :error="errors.portionPcs"
        required
      />
      <BaseInput
        v-model="form.stock"
        type="number"
        label="Stok (porsi)"
        placeholder="40"
        min="0"
        :error="errors.stock"
        required
      />
      <BaseInput
        v-model="form.minStock"
        type="number"
        label="Stok Minimum"
        placeholder="10"
        min="0"
        hint="Peringatan muncul jika stok ≤ angka ini."
        :error="errors.minStock"
        required
      />
      <label class="checkbox span-2">
        <input v-model="form.isActive" type="checkbox" />
        Menu aktif (tampil di halaman pemesanan)
      </label>
      <p v-if="errors.general" class="text-danger span-2">{{ errors.general }}</p>
    </form>
    <template #footer>
      <BaseButton variant="outline" @click="emit('close')">Batal</BaseButton>
      <BaseButton type="submit" form="product-form">Simpan</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}
</style>
