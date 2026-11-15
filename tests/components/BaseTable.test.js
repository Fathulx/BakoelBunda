import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTable from '@/components/common/BaseTable.vue'

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'price', label: 'Harga', align: 'right' },
  { key: 'actions', label: '' }
]
const rows = [{ id: 1, name: 'Dimsum', price: 18000 }]

describe('BaseTable (mode kartu di HP)', () => {
  it('setiap sel membawa label kolomnya untuk ditampilkan di mode kartu', () => {
    const wrapper = mount(BaseTable, { props: { columns, rows } })
    const cells = wrapper.findAll('tbody td')
    expect(cells.map((td) => td.attributes('data-label'))).toEqual(['Nama', 'Harga', ''])
  })

  it('kolom pertama menjadi judul kartu, kolom tanpa label menjadi baris aksi', () => {
    const wrapper = mount(BaseTable, { props: { columns, rows } })
    const cells = wrapper.findAll('tbody td')
    expect(cells[0].classes()).toContain('table__cell--title')
    expect(cells[1].classes()).not.toContain('table__cell--title')
    expect(cells[2].classes()).toContain('table__cell--action')
  })

  it('kolom berkey "actions" tetap jadi baris aksi walau berjudul "Aksi"', () => {
    const cols = [
      { key: 'name', label: 'Menu' },
      { key: 'actions', label: 'Aksi' }
    ]
    const wrapper = mount(BaseTable, { props: { columns: cols, rows } })
    expect(wrapper.findAll('tbody td')[1].classes()).toContain('table__cell--action')
  })

  it('pesan kosong tetap tampil bila tidak ada baris', () => {
    const wrapper = mount(BaseTable, { props: { columns, rows: [], emptyText: 'Belum ada menu.' } })
    expect(wrapper.find('.table__empty').text()).toBe('Belum ada menu.')
  })
})
