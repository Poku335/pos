import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null) // null | { mode: 'add' | 'edit', data? }
  const [name, setName] = useState('')
  const { showToast, toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/categories')
    setCategories(await res.json())
  }

  function openAdd() { setName(''); setModal({ mode: 'add' }) }
  function openEdit(cat) { setName(cat.name); setModal({ mode: 'edit', data: cat }) }
  function closeModal() { setModal(null) }

  async function save() {
    if (!name.trim()) return
    if (modal.mode === 'add') {
      await fetch('/api/categories/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      showToast('เพิ่มหมวดหมู่แล้ว')
    } else {
      await fetch(`/api/categories/${modal.data.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      showToast('แก้ไขแล้ว')
    }
    closeModal(); load()
  }

  async function remove(id) {
    if (!confirm('ลบหมวดหมู่นี้?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    showToast('ลบแล้ว'); load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>หมวดหมู่</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ เพิ่มหมวดหมู่</button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>#</th><th>ชื่อหมวดหมู่</th><th></th></tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>แก้ไข</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>ยังไม่มีหมวดหมู่</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.mode === 'add' ? 'เพิ่มหมวดหมู่' : 'แก้ไขหมวดหมู่'}</h2>
            <div className="form-group">
              <label>ชื่อหมวดหมู่</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={save}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
