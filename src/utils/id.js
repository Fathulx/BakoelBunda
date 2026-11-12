/** Membuat ID unik sederhana, misalnya "prd-lq2x9a3f". */
export function generateId(prefix) {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 6)
  return `${prefix}-${time}${random}`
}
