<script setup>
/**
 * Filter laporan penjualan.
 * v-model: { from, to (tanggal terima), status, paymentMethod, paymentStatus, orderType, search }.
 * Emits: reset.
 */
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  ORDER_TYPE_OPTIONS
} from '@/config/app'

const filter = defineModel({ type: Object, required: true })

const emit = defineEmits(['reset'])
</script>

<template>
  <div class="filter card">
    <BaseInput v-model="filter.from" type="date" label="Tanggal terima dari" />
    <BaseInput v-model="filter.to" type="date" label="Sampai" :min="filter.from || undefined" />
    <BaseSelect v-model="filter.status" label="Status" :options="ORDER_STATUS_OPTIONS" placeholder="Semua status" />
    <BaseSelect
      v-model="filter.paymentStatus"
      label="Status bayar"
      :options="PAYMENT_STATUS_OPTIONS"
      placeholder="Semua"
    />
    <BaseSelect
      v-model="filter.paymentMethod"
      label="Metode bayar"
      :options="PAYMENT_METHOD_OPTIONS"
      placeholder="Semua metode"
    />
    <BaseSelect v-model="filter.orderType" label="Cara terima" :options="ORDER_TYPE_OPTIONS" placeholder="Semua" />
    <BaseInput v-model="filter.search" label="Cari" placeholder="Invoice / nama / WA" />
    <BaseButton variant="outline" class="filter__reset" @click="emit('reset')">Reset</BaseButton>
  </div>
</template>

<style scoped>
.filter {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
  align-items: end;
}

.filter__reset {
  height: 40px;
}
</style>
