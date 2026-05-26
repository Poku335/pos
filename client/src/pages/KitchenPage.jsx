import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '../hooks/useToast'

const STATUS_NEXT = { pending: 'preparing', preparing: 'served' }
const STATUS_LABEL = { pending: 'รอ', preparing: 'กำลังทำ', served: 'เสิร์ฟแล้ว', cancelled: 'ยกเลิก' }

export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState({})
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('open')
  const [addModal, setAddModal] = useState(null) // { orderId, tableNumber }
  const [addCart, setAddCart] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const { showToast, toast } = useToast()
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    const [allOrders, prods] = await Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ])
    setOrders(allOrders)
    setProducts(prods)
    if (allOrders.length === 0) { setItems({}); return }
    const results = await Promise.all(
      allOrders.map(o => fetch(`/api/order-items/by-order/${o.id}`).then(r => r.json()))
    )
    const map = {}
    allOrders.forEach((o, i) => { map[o.id] = results[i] })
    setItems(map)
  }, [])

  useEffect(() => {
    load()
    timerRef.current = setInterval(load, 10000)
    return () => clearInterval(timerRef.current)
  }, [load])

  async function advanceStatus(itemId, current) {
    const next = STATUS_NEXT[current]
    if (!next) return
    await fetch(`/api/order-items/update-status/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    load()
  }

  async function closeOrder(orderId) {
    if (!confirm('ปิดบิลโต๊ะนี้?')) return
    await fetch(`/api/orders/close/${orderId}`, { method: 'PUT' })
    showToast('ปิดบิลแล้ว')
    load()
  }

  // --- Add items modal ---
  function openAddModal(order) {
    setAddModal({ orderId: order.id, tableNumber: order.tableNumber })
    setAddCart([])
  }

  function addToAddCart(product) {
    setAddCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function changeAddQty(id, delta) {
    setAddCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    )
  }

  async function submitAddItems() {
    if (addCart.length === 0) return
    setSubmitting(true)
    try {
      await Promise.all(addCart.map(item =>
        fetch('/api/order-items/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: addModal.orderId, productId: item.id, quantity: item.qty }),
        })
      ))
      showToast(`เพิ่มรายการโต๊ะ ${addModal.tableNumber} แล้ว ✓`)
      setAddModal(null)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  const visible = orders.filter(o => o.status === filter)
  const addTotal = addCart.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div>
      <div className="page-header">
        <h1>ห้องครัว</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${filter === 'open' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('open')}>ออเดอร์เปิด</button>
          <button className={`btn ${filter === 'closed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('closed')}>ปิดแล้ว</button>
          <button className="btn btn-ghost" onClick={load}>⟳ รีเฟรช</button>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: 48 }}>
          {filter === 'open' ? 'ไม่มีออเดอร์ที่เปิดอยู่' : 'ไม่มีออเดอร์ที่ปิดแล้ว'}
        </div>
      )}

      <div className="kitchen-grid">
        {visible.map(order => {
          const orderItems = items[order.id] || []
          return (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>โต๊ะ {order.tableNumber}</strong>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>#{order.id} · {order.createdAt?.slice(0, 16)}</p>
                </div>
                <span className={`status-badge status-${order.status}`}>
                  {order.status === 'open' ? 'เปิด' : 'ปิดแล้ว'}
                </span>
              </div>

              {orderItems.length === 0 && (
                <p style={{ color: '#9ca3af', fontSize: '0.82rem', padding: '8px 0' }}>ไม่มีรายการ</p>
              )}

              {orderItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span className={`status-badge status-${item.status}`}>{STATUS_LABEL[item.status]}</span>
                  <span style={{ flex: 1, fontSize: '0.875rem' }}>{item.product_name} x{item.quantity}</span>
                  {STATUS_NEXT[item.status] && order.status === 'open' && (
                    <button className="btn btn-sm btn-primary" onClick={() => advanceStatus(item.id, item.status)}>
                      → {STATUS_LABEL[STATUS_NEXT[item.status]]}
                    </button>
                  )}
                </div>
              ))}

              {order.status === 'open' && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>฿{order.totalPrice}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-warning btn-sm" onClick={() => openAddModal(order)}>+ รายการ</button>
                    <button className="btn btn-success btn-sm" onClick={() => closeOrder(order.id)}>ปิดบิล</button>
                  </div>
                </div>
              )}
              {order.status === 'closed' && (
                <p style={{ marginTop: 10, fontWeight: 700, color: '#10b981' }}>ยอดรวม ฿{order.totalPrice}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal เพิ่มรายการ */}
      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(null)}>
          <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <h2>เพิ่มรายการ — โต๊ะ {addModal.tableNumber}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, maxHeight: '60vh', overflow: 'hidden' }}>
              {/* รายการสินค้า */}
              <div style={{ overflowY: 'auto' }}>
                {products.map(p => (
                  <div
                    key={p.id}
                    onClick={() => addToAddCart(p)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  >
                    {p.image_type
                      ? <img src={`/api/products/${p.id}/image`} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🍽</div>}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#4f46e5' }}>฿{p.price}</div>
                    </div>
                    <button className="btn btn-primary btn-sm">+</button>
                  </div>
                ))}
                {products.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>ไม่มีสินค้า</p>}
              </div>

              {/* Mini cart */}
              <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 14, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.85rem' }}>รายการที่เพิ่ม</p>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {addCart.length === 0
                    ? <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>ยังไม่มี</p>
                    : addCart.map(item => (
                      <div key={item.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <button className="cart-item-qty" style={{ width: 22, height: 22, border: '1px solid #e5e7eb', borderRadius: 4, background: '#f9fafb', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => changeAddQty(item.id, -1)}>−</button>
                          <span style={{ fontSize: '0.82rem' }}>{item.qty}</span>
                          <button style={{ width: 22, height: 22, border: '1px solid #e5e7eb', borderRadius: 4, background: '#f9fafb', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => changeAddQty(item.id, 1)}>+</button>
                          <span style={{ marginLeft: 'auto', color: '#4f46e5', fontSize: '0.78rem', fontWeight: 700 }}>฿{(item.price * item.qty).toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                </div>
                {addCart.length > 0 && (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                      <span>รวม</span><span>฿{addTotal.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setAddModal(null)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={submitAddItems} disabled={submitting || addCart.length === 0}>
                {submitting ? 'กำลังส่ง...' : 'ยืนยันเพิ่มรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
