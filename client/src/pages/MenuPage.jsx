import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1)

export default function MenuPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [catFilter, setCatFilter] = useState('all')
  const [selectedTable, setSelectedTable] = useState(null)
  const [carts, setCarts] = useState({})   // { tableNumber: [{...product, qty}] }
  const [submitting, setSubmitting] = useState(false)
  const { showToast, toast } = useToast()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [p, c, o] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ])
    setProducts(p); setCategories(c); setOrders(o)
  }

  const openOrders = orders.filter(o => o.status === 'open')
  const cart = selectedTable ? (carts[selectedTable] || []) : []
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const filtered = catFilter === 'all' ? products : products.filter(p => p.category?.id === catFilter)

  function addToCart(product) {
    if (!selectedTable) return showToast('เลือกโต๊ะก่อน')
    setCarts(prev => {
      const current = prev[selectedTable] || []
      const ex = current.find(i => i.id === product.id)
      const updated = ex
        ? current.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...current, { ...product, qty: 1 }]
      return { ...prev, [selectedTable]: updated }
    })
  }

  function changeQty(id, delta) {
    if (!selectedTable) return
    setCarts(prev => {
      const updated = (prev[selectedTable] || [])
        .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
      return { ...prev, [selectedTable]: updated }
    })
  }

  async function submitOrder() {
    if (!selectedTable) return showToast('กรุณาเลือกโต๊ะก่อน')
    if (cart.length === 0) return showToast('กรุณาเพิ่มรายการก่อน')
    setSubmitting(true)
    try {
      let order = openOrders.find(o => o.tableNumber === selectedTable)
      if (!order) {
        const res = await fetch('/api/orders/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableNumber: selectedTable, customerCount: 1 }),
        })
        order = await res.json()
      }
      await Promise.all(cart.map(item =>
        fetch('/api/order-items/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, productId: item.id, quantity: item.qty }),
        })
      ))
      showToast(`ส่งออเดอร์โต๊ะ ${selectedTable} แล้ว ✓`)
      setCarts(prev => ({ ...prev, [selectedTable]: [] }))
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header"><h1>สั่งอาหาร</h1></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 10 }}>เลือกโต๊ะ</p>
        <div className="table-select">
          {TABLES.map(n => {
            const occupied = openOrders.some(o => o.tableNumber === n)
            const hasItems = (carts[n] || []).length > 0
            return (
              <button
                key={n}
                className={`table-btn ${selectedTable === n ? 'active' : ''} ${occupied && selectedTable !== n ? 'occupied' : ''}`}
                onClick={() => setSelectedTable(n)}
                style={{ position: 'relative' }}
              >
                {n}
                {hasItems && selectedTable !== n && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                )}
              </button>
            )
          })}
        </div>
        {selectedTable && (
          <p style={{ fontSize: '0.8rem', color: '#4f46e5', marginTop: 8 }}>
            โต๊ะ {selectedTable} — {openOrders.some(o => o.tableNumber === selectedTable) ? 'มีออเดอร์อยู่' : 'ว่าง'}
          </p>
        )}
      </div>

      <div className="pos-grid">
        <div>
          <div className="menu-filter">
            <button className={catFilter === 'all' ? 'active' : ''} onClick={() => setCatFilter('all')}>ทั้งหมด</button>
            {categories.map(c => (
              <button key={c.id} className={catFilter === c.id ? 'active' : ''} onClick={() => setCatFilter(c.id)}>{c.name}</button>
            ))}
          </div>
          <div className="menu-items">
            {filtered.map(p => (
              <div key={p.id} className="menu-card" onClick={() => addToCart(p)}>
                {p.image_type
                  ? <img src={`/api/products/${p.id}/image`} alt={p.name} />
                  : <div className="no-img">🍽</div>}
                <div className="menu-card-body">
                  <strong>{p.name}</strong>
                  <p className="menu-card-price">฿{p.price}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ color: '#9ca3af', gridColumn: '1/-1' }}>ไม่มีสินค้า</p>}
          </div>
        </div>

        <div className="cart">
          <h3>
            {selectedTable ? `โต๊ะ ${selectedTable}` : 'เลือกโต๊ะก่อน'}
            {cart.length > 0 && (
              <span style={{ marginLeft: 8, background: '#4f46e5', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: '0.75rem' }}>
                {cart.length}
              </span>
            )}
          </h3>
          {!selectedTable
            ? <p className="cart-empty">กรุณาเลือกโต๊ะ</p>
            : cart.length === 0
              ? <p className="cart-empty">ยังไม่มีรายการ<br />กดสินค้าเพื่อเพิ่ม</p>
              : cart.map(item => (
                <div key={item.id} className="cart-item">
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <div className="cart-item-qty">
                    <button onClick={() => changeQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)}>+</button>
                  </div>
                  <span style={{ minWidth: 60, textAlign: 'right', color: '#4f46e5', fontWeight: 600 }}>
                    ฿{(item.price * item.qty).toFixed(0)}
                  </span>
                </div>
              ))}
          <div className="cart-total"><span>รวม</span><span>฿{total.toFixed(0)}</span></div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 14, width: '100%' }}
            onClick={submitOrder}
            disabled={submitting || !selectedTable || cart.length === 0}
          >
            {submitting ? 'กำลังส่ง...' : 'ส่งออเดอร์'}
          </button>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
