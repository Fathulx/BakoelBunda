import { APP_CONFIG } from '@/config/app'

const currencyFormatter = new Intl.NumberFormat(APP_CONFIG.locale, {
  style: 'currency',
  currency: APP_CONFIG.currency,
  maximumFractionDigits: 0
})

const dateFormatter = new Intl.DateTimeFormat(APP_CONFIG.locale, {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

const longDateFormatter = new Intl.DateTimeFormat(APP_CONFIG.locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const timeFormatter = new Intl.DateTimeFormat(APP_CONFIG.locale, {
  hour: '2-digit',
  minute: '2-digit'
})

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)

export const formatDate = (iso) => (iso ? dateFormatter.format(new Date(iso)) : '-')

/** Contoh: "Rabu, 11 November 2026". */
export const formatLongDate = (dateLike = new Date()) => longDateFormatter.format(new Date(dateLike))

export const formatTime = (iso) => (iso ? timeFormatter.format(new Date(iso)) : '-')

export const formatDateTime = (iso) => (iso ? `${formatDate(iso)}, ${formatTime(iso)}` : '-')

const pad = (num, size = 2) => String(num).padStart(size, '0')

/** Tanggal lokal dalam format YYYY-MM-DD (dipakai untuk filter dan pengelompokan harian). */
export function toDateKey(dateLike = new Date()) {
  const date = new Date(dateLike)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Tanggal lokal dalam format YYYYMMDD (dipakai untuk nomor invoice). */
export const toCompactDate = (dateLike = new Date()) => toDateKey(dateLike).replaceAll('-', '')

export const padNumber = pad

/** Selisih waktu dalam menit, dibulatkan ke bawah. */
export function minutesSince(iso, now = Date.now()) {
  if (!iso) return 0
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))
}

/** Ubah nomor HP Indonesia (08xx / +628xx) ke format tautan wa.me (628xx). */
export function toWhatsAppLink(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const international = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${international}`
}
