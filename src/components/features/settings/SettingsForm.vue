<script setup>
/**
 * Form Pengaturan Toko.
 * v-model: objek pengaturan { businessWhatsApp, pickupAddress, orderCutoffTime, maxDaysAhead,
 *          handoverStart, handoverEnd, bankName, bankAccountNo, bankAccountName }.
 * Props: errors. Emits: submit, reset.
 */
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { VALIDATION_LIMITS } from '@/config/app'

const form = defineModel({ type: Object, required: true })

defineProps({
  errors: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['submit', 'reset'])
</script>

<template>
  <form class="settings card" novalidate @submit.prevent="emit('submit')">
    <fieldset class="form-grid">
      <legend class="section-title span-2">Pemesanan</legend>
      <BaseInput
        v-model="form.orderCutoffTime"
        type="time"
        label="Jam batas pesanan"
        hint="Pesanan setelah jam ini tetap untuk besok, ditandai pesanan susulan."
        :error="errors.orderCutoffTime"
        required
      />
      <BaseInput
        v-model="form.maxDaysAhead"
        type="number"
        label="Bisa pesan sampai (hari ke depan)"
        :min="VALIDATION_LIMITS.maxDaysAhead.min"
        :max="VALIDATION_LIMITS.maxDaysAhead.max"
        :error="errors.maxDaysAhead"
        required
      />
      <BaseInput
        v-model="form.handoverStart"
        type="time"
        label="Jam mulai antar / ambil"
        :error="errors.handoverStart"
        required
      />
      <BaseInput
        v-model="form.handoverEnd"
        type="time"
        label="Jam selesai antar / ambil"
        :error="errors.handoverEnd"
        required
      />
    </fieldset>

    <fieldset class="form-grid">
      <legend class="section-title span-2">Kontak dan pengambilan</legend>
      <BaseInput
        v-model="form.businessWhatsApp"
        type="tel"
        label="WhatsApp usaha"
        placeholder="081234567890"
        hint="Pembeli mengirim bukti transfer ke nomor ini."
        :error="errors.businessWhatsApp"
        required
      />
      <BaseTextarea
        v-model="form.pickupAddress"
        class="span-2"
        label="Alamat pengambilan (rumah)"
        :rows="2"
        :maxlength="VALIDATION_LIMITS.address.max"
        :error="errors.pickupAddress"
      />
    </fieldset>

    <fieldset class="form-grid">
      <legend class="section-title span-2">Rekening pembayaran di muka</legend>
      <BaseInput
        v-model="form.bankName"
        label="Nama bank"
        placeholder="BCA"
        :maxlength="VALIDATION_LIMITS.bankName.max"
        :error="errors.bankName"
        required
      />
      <BaseInput
        v-model="form.bankAccountNo"
        label="Nomor rekening"
        inputmode="numeric"
        :error="errors.bankAccountNo"
        required
      />
      <BaseInput
        v-model="form.bankAccountName"
        class="span-2"
        label="Atas nama"
        :maxlength="VALIDATION_LIMITS.bankAccountName.max"
        :error="errors.bankAccountName"
        required
      />
    </fieldset>

    <div class="settings__actions">
      <BaseButton variant="outline" @click="emit('reset')">Batalkan perubahan</BaseButton>
      <BaseButton type="submit">Simpan pengaturan</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.settings {
  display: grid;
  gap: var(--space-6);
  max-width: 760px;
}

fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}

legend {
  padding: 0;
  margin-bottom: var(--space-3);
}

.settings__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
}
</style>
