<script setup>
/**
 * Kontak pembeli di kartu pesanan: alamat antar dan tautan WhatsApp.
 * Props: order.
 */
import { computed } from 'vue'
import { ORDER_TYPE } from '@/config/app'
import { toWhatsAppLink } from '@/utils/format'

const props = defineProps({
  order: { type: Object, required: true }
})

const isDelivery = computed(() => props.order.orderType === ORDER_TYPE.DELIVERY)
const whatsAppLink = computed(() => toWhatsAppLink(props.order.customerPhone))
</script>

<template>
  <div v-if="whatsAppLink || (isDelivery && order.address)" class="contact">
    <p v-if="isDelivery && order.address">{{ order.address }}</p>
    <a v-if="whatsAppLink" :href="whatsAppLink" target="_blank" rel="noopener" class="contact__wa">
      WhatsApp {{ order.customerPhone }}
    </a>
  </div>
</template>

<style scoped>
.contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-small);
  color: var(--color-text-muted);
}

.contact__wa {
  align-self: flex-start;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
