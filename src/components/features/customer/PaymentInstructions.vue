<script setup>
/**
 * Instruksi transfer untuk pesanan "bayar di muka" yang belum lunas.
 * Props: order, settings (Pengaturan Toko: bankName, bankAccountNo, bankAccountName, businessWhatsApp).
 */
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency, toWhatsAppLink } from '@/utils/format'

const props = defineProps({
  order: { type: Object, required: true },
  settings: { type: Object, required: true }
})

const confirmLink = computed(() => {
  const base = toWhatsAppLink(props.settings.businessWhatsApp)
  const text = `Halo, saya sudah transfer untuk pesanan ${props.order.invoiceNo} atas nama ${props.order.customerName} sebesar ${formatCurrency(props.order.total)}.`
  return base ? `${base}?text=${encodeURIComponent(text)}` : ''
})
</script>

<template>
  <section class="pay" aria-label="Cara pembayaran">
    <h2>Selesaikan pembayaran</h2>
    <p>Transfer <strong class="figure">{{ formatCurrency(order.total) }}</strong> ke rekening berikut:</p>
    <dl class="pay__account">
      <dt>Bank</dt>
      <dd>{{ settings.bankName }}</dd>
      <dt>Nomor rekening</dt>
      <dd class="pay__number">{{ settings.bankAccountNo }}</dd>
      <dt>Atas nama</dt>
      <dd>{{ settings.bankAccountName }}</dd>
    </dl>
    <p class="text-muted text-small">
      Kirim bukti transfer lewat WhatsApp. Status berubah menjadi Lunas setelah Admin memeriksa transfer.
    </p>
    <a v-if="confirmLink" :href="confirmLink" target="_blank" rel="noopener">
      <BaseButton variant="secondary">Kirim bukti via WhatsApp</BaseButton>
    </a>
  </section>
</template>

<style scoped>
.pay {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-secondary-soft);
  border: 1px solid var(--color-secondary);
}

.pay h2 {
  font-size: var(--font-size-lead);
}

.pay__account {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-1) var(--space-4);
}

.pay__account dt {
  color: var(--color-text-muted);
}

.pay__account dd {
  margin: 0;
  font-weight: var(--font-weight-semibold);
}

.pay__number {
  letter-spacing: 0.04em;
}
</style>
