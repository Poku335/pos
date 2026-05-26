import { useState, useEffect, useRef } from 'react'
import { useToast } from '../hooks/useToast'

const EMPTY = { name: '', description: '', price: '', category_id: '', image: null }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()
  const { showToast, toast } = useToast()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [p, c] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
    setProducts(p); setCategories(c)
  }

  function openAdd() { setForm(EMPTY); setPreview(null); setModal({ mode: 'add' }) }
  function openEdit(p) {
    setForm({ name: p.name, description: p.description || '', price: p.price, category_id: p.category?.id || '', image: null })
    setPreview(p.image_type ? `/api/products/${p.id}/image` : null)
    setModal({ mode: 'edit', id: p.id })
  }
  function closeModal() { setModal(null); setPreview(null) }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  async function save() {
    if (!form.name || !form.price) return showToast('กรุณากรอกชื่อและราคา')
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('price', form.price)
    fd.append('description', form.description)
    if (form.category_id) fd.append('category_id', form.category_id)
    if (form.image) fd.append('image', form.image)

    if (modal.mode === 'add') {
      await fetch('/api/products/add', { method: 'POST', body: fd })
      showToast('เพิ่มสินค้าแล้ว')
    } else {
      await fetch(`/api/products/${modal.id}`, { method: 'PUT', body: fd })
      showToast('แก้ไขแล้ว')
    }
    closeModal(); loadAll()
  }

  async function remove(id) {
    if (!confirm('ลบสินค้านี้?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    showToast('ลบแล้ว'); loadAll()
  }

  return (
    <div>
      <div className="page-header">
        <h1>สินค้า</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ เพิ่มสินค้า</button>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>รูป</th><th>ชื่อ</th><th>หมวดหมู่</th><th>ราคา</th><th></th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  {p.image_type
                    ? <img className="img-preview" src={`/api/products/${p.id}/image`} alt={p.name} />
                    : <div className="img-placeholder">🍽</div>}
                </td>
                <td>
                  <strong>{p.name}</strong>
                  {p.description && <><br /><span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{p.description}</span></>}
                </td>
                <td>{p.category?.name || '—'}</td>
                <td><strong style={{ color: '#4f46e5' }}>฿{p.price}</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>แก้ไข</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>ยังไม่มีสินค้า</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.mode === 'add' ? 'เพิ่มสินค้า' : 'แก้ไขสินค้า'}</h2>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>ชื่อสินค้า *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>ราคา (฿) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>คำอธิบาย</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>หมวดหมู่</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">— ไม่มีหมวดหมู่ —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>รูปภาพสินค้า</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {preview
                  ? <img className="img-preview" src={preview} alt="preview" />
                  : <div className="img-placeholder">📷</div>}
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current.click()}>เลือกรูป</button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>
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
