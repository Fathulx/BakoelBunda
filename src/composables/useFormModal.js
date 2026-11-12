import { ref, computed } from 'vue'

/**
 * Pola umum halaman CRUD: buka modal tambah/ubah, simpan error validasi dari store,
 * dan tutup modal setelah berhasil.
 */
export function useFormModal() {
  const show = ref(false)
  const editing = ref(null)
  const errors = ref({})

  const isEdit = computed(() => Boolean(editing.value))

  function openCreate() {
    editing.value = null
    errors.value = {}
    show.value = true
  }

  function openEdit(item) {
    editing.value = item
    errors.value = {}
    show.value = true
  }

  function close() {
    show.value = false
    editing.value = null
    errors.value = {}
  }

  return { show, editing, errors, isEdit, openCreate, openEdit, close }
}
