import {
  VALIDATION_LIMITS as L,
  ROLE_OPTIONS,
  ORDER_TYPE,
  ORDER_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS
} from '@/config/app'
import { deliveryDateError } from '@/utils/orderDates'

/**
 * Semua fungsi validasi mengembalikan objek error.
 * Kunci = nama field, nilai = pesan error. Objek kosong berarti valid.
 */

export const hasErrors = (errors) => Object.keys(errors).length > 0

const isBlank = (value) => value === '' || value === null || value === undefined

const text = (value) => String(value ?? '').trim()

function checkInteger(value, { label, min, max }) {
  if (isBlank(value)) return `${label} wajib diisi.`
  const num = Number(value)
  if (Number.isNaN(num)) return `${label} harus berupa angka.`
  if (!Number.isInteger(num)) return `${label} harus bilangan bulat.`
  if (num < min) return min === 1 ? `${label} harus lebih dari 0.` : `${label} minimal ${min}.`
  if (num > max) return `${label} maksimal ${max.toLocaleString('id-ID')}.`
  return null
}

export function validateProduct(data, existingProducts = [], currentId = null) {
  const errors = {}
  const name = text(data.name)

  if (!name) errors.name = 'Nama menu wajib diisi.'
  else if (name.length < L.productName.min) errors.name = `Nama menu minimal ${L.productName.min} karakter.`
  else if (name.length > L.productName.max) errors.name = `Nama menu maksimal ${L.productName.max} karakter.`
  else if (
    existingProducts.some((p) => p.id !== currentId && p.name.toLowerCase() === name.toLowerCase())
  ) {
    errors.name = 'Nama menu sudah digunakan.'
  }

  if (text(data.description).length > L.description.max) {
    errors.description = `Deskripsi maksimal ${L.description.max} karakter.`
  }

  const priceError = checkInteger(data.price, { label: 'Harga', ...L.price })
  if (priceError) errors.price = priceError

  const pcsError = checkInteger(data.portionPcs, { label: 'Isi per porsi', ...L.portionPcs })
  if (pcsError) errors.portionPcs = pcsError

  const stockError = checkInteger(data.stock, { label: 'Stok', ...L.stock })
  if (stockError) errors.stock = stockError

  const minStockError = checkInteger(data.minStock, { label: 'Stok minimum', ...L.stock })
  if (minStockError) errors.minStock = minStockError

  return errors
}

export function validateUser(data, existingUsers = [], currentId = null) {
  const errors = {}
  const isEdit = Boolean(currentId)
  const name = text(data.name)
  const username = text(data.username).toLowerCase()
  const password = String(data.password ?? '')

  if (!name) errors.name = 'Nama wajib diisi.'
  else if (name.length < L.personName.min) errors.name = `Nama minimal ${L.personName.min} karakter.`
  else if (name.length > L.personName.max) errors.name = `Nama maksimal ${L.personName.max} karakter.`

  if (!username) errors.username = 'Username wajib diisi.'
  else if (username.length < L.username.min || username.length > L.username.max) {
    errors.username = `Username harus ${L.username.min}-${L.username.max} karakter.`
  } else if (!L.username.pattern.test(username)) {
    errors.username = 'Username hanya boleh huruf kecil, angka, dan garis bawah.'
  } else if (existingUsers.some((u) => u.id !== currentId && u.username === username)) {
    errors.username = 'Username sudah digunakan.'
  }

  // Saat edit, kata sandi boleh dikosongkan (artinya tidak diubah).
  if (!isEdit && !password) errors.password = 'Kata sandi wajib diisi.'
  else if (password && password.length < L.password.min) {
    errors.password = `Kata sandi minimal ${L.password.min} karakter.`
  } else if (password.length > L.password.max) {
    errors.password = `Kata sandi maksimal ${L.password.max} karakter.`
  }

  if (!ROLE_OPTIONS.some((r) => r.value === data.role)) errors.role = 'Role wajib dipilih.'

  return errors
}

/**
 * Validasi checkout halaman pemesanan pembeli.
 * @param {object} data   { lines, customerName, customerPhone, address, deliveryDate, note, orderType, paymentMethod }
 * @param {Map} productsById  produk terkini, untuk cek stok dan status aktif
 * @param {object} options  now (waktu pesan), settings (Pengaturan Toko, untuk batas tanggal)
 */
export function validateCheckout(data, productsById, { now = new Date(), settings } = {}) {
  const errors = {}
  const customerName = text(data.customerName)
  const phone = text(data.customerPhone).replace(/[\s-]/g, '')
  const address = text(data.address)
  const isDelivery = data.orderType === ORDER_TYPE.DELIVERY

  if (!data.lines?.length) {
    errors.cart = 'Keranjang masih kosong. Pilih minimal 1 menu.'
  } else {
    for (const line of data.lines) {
      const product = productsById.get(line.productId)
      if (!product || !product.isActive) {
        errors.cart = `Menu "${line.name}" sudah tidak tersedia.`
        break
      }
      if (line.qty < 1) {
        errors.cart = `Jumlah "${line.name}" minimal 1.`
        break
      }
      if (line.qty > product.stock) {
        errors.cart = `Stok "${product.name}" tidak cukup (sisa ${product.stock} porsi).`
        break
      }
    }
  }

  if (!customerName) errors.customerName = 'Nama pelanggan wajib diisi.'
  else if (customerName.length < L.customerName.min) {
    errors.customerName = `Nama pelanggan minimal ${L.customerName.min} karakter.`
  } else if (customerName.length > L.customerName.max) {
    errors.customerName = `Nama pelanggan maksimal ${L.customerName.max} karakter.`
  }

  // Nomor WhatsApp dipakai Admin untuk konfirmasi dan menagih pembayaran.
  if (!phone) errors.customerPhone = 'Nomor WhatsApp wajib diisi.'
  else if (!L.phone.pattern.test(phone)) {
    errors.customerPhone = 'Nomor WhatsApp tidak valid. Contoh: 081234567890.'
  }

  if (!ORDER_TYPE_OPTIONS.some((o) => o.value === data.orderType)) {
    errors.orderType = 'Pilih cara pesanan diterima.'
  }

  if (isDelivery) {
    if (!address) errors.address = 'Alamat pengantaran wajib diisi.'
    else if (address.length < L.address.min) {
      errors.address = 'Alamat terlalu singkat. Tulis nama jalan, nomor rumah, dan patokan.'
    } else if (address.length > L.address.max) {
      errors.address = `Alamat maksimal ${L.address.max} karakter.`
    }
  }

  const dateError = deliveryDateError(text(data.deliveryDate), now, settings)
  if (dateError) errors.deliveryDate = dateError

  if (text(data.note).length > L.orderNote.max) {
    errors.note = `Catatan maksimal ${L.orderNote.max} karakter.`
  }

  if (!PAYMENT_METHOD_OPTIONS.some((o) => o.value === data.paymentMethod)) {
    errors.paymentMethod = 'Metode pembayaran wajib dipilih.'
  }

  return errors
}

/**
 * Validasi Pengaturan Toko (jam batas pesanan, jam serah terima, rekening, alamat ambil).
 * @param {object} data { businessWhatsApp, pickupAddress, orderCutoffTime, maxDaysAhead,
 *                        handoverStart, handoverEnd, bankName, bankAccountNo, bankAccountName }
 */
export function validateSettings(data) {
  const errors = {}
  const phone = text(data.businessWhatsApp).replace(/[\s-]/g, '')
  const address = text(data.pickupAddress)
  const timeFields = {
    orderCutoffTime: 'Jam batas pesanan',
    handoverStart: 'Jam mulai serah terima',
    handoverEnd: 'Jam selesai serah terima'
  }

  if (!phone) errors.businessWhatsApp = 'Nomor WhatsApp usaha wajib diisi.'
  else if (!L.phone.pattern.test(phone)) {
    errors.businessWhatsApp = 'Nomor WhatsApp tidak valid. Contoh: 081234567890.'
  }

  if (!address) errors.pickupAddress = 'Alamat pengambilan wajib diisi.'
  else if (address.length < L.address.min) errors.pickupAddress = 'Alamat pengambilan terlalu singkat.'
  else if (address.length > L.address.max) errors.pickupAddress = `Alamat maksimal ${L.address.max} karakter.`

  for (const [field, label] of Object.entries(timeFields)) {
    const value = text(data[field])
    if (!value) errors[field] = `${label} wajib diisi.`
    else if (!L.time.pattern.test(value)) errors[field] = `${label} harus berformat JJ:MM, misalnya 20:00.`
  }
  // Format JJ:MM bisa dibandingkan langsung sebagai teks.
  if (!errors.handoverStart && !errors.handoverEnd && text(data.handoverEnd) <= text(data.handoverStart)) {
    errors.handoverEnd = 'Jam selesai harus setelah jam mulai.'
  }

  const daysError = checkInteger(data.maxDaysAhead, { label: 'Batas hari pemesanan', ...L.maxDaysAhead })
  if (daysError) errors.maxDaysAhead = daysError

  const bankName = text(data.bankName)
  if (!bankName) errors.bankName = 'Nama bank wajib diisi.'
  else if (bankName.length < L.bankName.min || bankName.length > L.bankName.max) {
    errors.bankName = `Nama bank harus ${L.bankName.min}-${L.bankName.max} karakter.`
  }

  const accountNo = text(data.bankAccountNo).replace(/[\s-]/g, '')
  if (!accountNo) errors.bankAccountNo = 'Nomor rekening wajib diisi.'
  else if (!L.bankAccountNo.pattern.test(accountNo)) errors.bankAccountNo = 'Nomor rekening hanya angka, 6-20 digit.'

  const accountName = text(data.bankAccountName)
  if (!accountName) errors.bankAccountName = 'Nama pemilik rekening wajib diisi.'
  else if (accountName.length < L.bankAccountName.min || accountName.length > L.bankAccountName.max) {
    errors.bankAccountName = `Nama pemilik rekening harus ${L.bankAccountName.min}-${L.bankAccountName.max} karakter.`
  }

  return errors
}
