<script setup>
/**
 * Form data pembeli di halaman pemesanan PO.
 * v-model: { customerName, customerPhone, orderType, address, deliveryDate, note, paymentMethod }.
 * Props: total, errors, disabled, minDate, maxDate (batas tanggal terima "YYYY-MM-DD"),
 *        settings (Pengaturan Toko: pickupAddress, handoverStart, handoverEnd).
 * Emits: submit.
 */
import { computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  ORDER_TYPE,
  ORDER_TYPE_OPTIONS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_OPTIONS,
  VALIDATION_LIMITS
} from '@/config/app'

const form = defineModel({ type: Object, required: true })

const props = defineProps({
  total: { type: Number, required: true },
  errors: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
  minDate: { type: String, required: true },
  maxDate: { type: String, required: true },
  settings: { type: Object, required: true }
})

const emit = defineEmits(['submit'])

const isDelivery = computed(() => form.value.orderType === ORDER_TYPE.DELIVERY)
const handoverHours = computed(() => `${props.settings.handoverStart}–${props.settings.handoverEnd}`)
const paymentHint = computed(() => {
  if (form.value.paymentMethod === PAYMENT_METHOD.PREPAID) {
    return 'Nomor rekening tampil setelah pesanan dikirim. Kirim bukti transfer lewat WhatsApp.'
  }
  return isDelivery.value ? 'Dibayar ke kurir saat pesanan diterima.' : 'Dibayar saat mengambil pesanan.'
})
</script>

<template>
  <form class="checkout" novalidate @submit.prevent="emit('submit')">
    <BaseInput
      v-model="form.customerName"
      label="Nama"
      autocomplete="name"
      placeholder="Nama pemesan"
      :maxlength="VALIDATION_LIMITS.customerName.max"
      :error="errors.customerName"
      required
    />

    <BaseInput
      v-model="form.customerPhone"
      type="tel"
      label="Nomor WhatsApp"
      autocomplete="tel"
      inputmode="tel"
      placeholder="081234567890"
      hint="Admin menghubungi nomor ini untuk konfirmasi pesanan."
      :error="errors.customerPhone"
      required
    />

    <BaseInput
      v-model="form.deliveryDate"
      type="date"
      label="Untuk tanggal"
      :min="minDate"
      :max="maxDate"
      :hint="`Dimsum dibuat setelah dipesan. Antar / ambil pukul ${handoverHours}.`"
      :error="errors.deliveryDate"
      required
    />

    <fieldset class="checkout__group">
      <legend>Cara menerima pesanan</legend>
      <div class="segmented">
        <label v-for="option in ORDER_TYPE_OPTIONS" :key="option.value" class="segmented__item">
          <input v-model="form.orderType" type="radio" name="orderType" :value="option.value" />
          <span>{{ option.label }}</span>
        </label>
      </div>
      <p v-if="errors.orderType" class="text-danger text-small">{{ errors.orderType }}</p>
    </fieldset>

    <BaseTextarea
      v-if="isDelivery"
      v-model="form.address"
      class="checkout__full"
      label="Alamat pengantaran"
      :rows="3"
      :maxlength="VALIDATION_LIMITS.address.max"
      placeholder="Nama jalan, nomor rumah, dan patokan"
      :error="errors.address"
    />
    <p v-else class="checkout__info checkout__full">Ambil di: {{ settings.pickupAddress }}</p>

    <BaseInput
      v-model="form.note"
      class="checkout__full"
      label="Catatan (opsional)"
      placeholder="Contoh: saus dipisah"
      :maxlength="VALIDATION_LIMITS.orderNote.max"
      :error="errors.note"
    />

    <fieldset class="checkout__group checkout__full">
      <legend>Pembayaran</legend>
      <div class="segmented">
        <label v-for="option in PAYMENT_METHOD_OPTIONS" :key="option.value" class="segmented__item">
          <input v-model="form.paymentMethod" type="radio" name="paymentMethod" :value="option.value" />
          <span>{{ option.label }}</span>
        </label>
      </div>
      <p class="text-muted text-small">{{ paymentHint }}</p>
      <p v-if="errors.paymentMethod" class="text-danger text-small">{{ errors.paymentMethod }}</p>
    </fieldset>

    <BaseButton type="submit" size="lg" block class="checkout__full" :disabled="disabled || !total">
      Kirim pesanan
    </BaseButton>
    <p v-if="!total" class="text-muted text-small checkout__full">Tambahkan minimal 1 menu ke keranjang untuk mengirim pesanan.</p>
  </form>
</template>

<style scoped>
/* Dua kolom bila lebar cukup (desktop), satu kolom di HP. */
.checkout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: var(--space-3) var(--space-4);
  align-items: start;
}

.checkout__full {
  grid-column: 1 / -1;
}

.checkout__group {
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.checkout__group legend {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-1);
}

.checkout__info {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-secondary-soft);
  font-size: var(--font-size-small);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

.segmented__item input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.segmented__item span {
  display: block;
  padding: 10px 8px;
  text-align: center;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: background var(--transition), border-color var(--transition);
}

.segmented__item input:checked + span {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.segmented__item input:focus-visible + span {
  box-shadow: var(--focus-ring);
}
</style>
