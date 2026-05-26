import { useState, useEffect } from 'react'

const STATUS_LABEL = { pending: 'รอ', preparing: 'กำลังทำ', served: 'เสิร์ฟแล้ว', cancelled: 'ยกเลิก' }

export default function HistoryPage() {
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const all = await fetch('/api/orders').then(r => r.json())
      setOrders(all.filter(o => o.status === 'closed').reverse())
      setLoading(false)
    }
    load()
  }, [])

  async function toggleExpand(orderId) {
    if (expanded === orderId) { setExpanded(null); return }
    setExpanded(orderId)
    if (!items[orderId]) {
      const rows = await fetch(`/api/order-items/by-order/${orderId}`).then(r => r.json())
      setItems(prev => ({ ...prev, [orderId]: rows }))
    }
  }

  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0)

  return (
    <div>
      <div className="page-header">
        <h1>ประวัติ</h1>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>บิลทั้งหมด {orders.length} รายการ</p>
          <p style={{ fontWeight: 700, color: '#4f46e5', fontSize: '1.1rem' }}>รวม ฿{totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {loading && <p style={{ color: '#9ca3af', textAlign: 'center', padding: 48 }}>กำลังโหลด...</p>}

      {!loading && orders.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: 48 }}>
          ยังไม่มีประวัติการขาย
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.map(order => (
          <div key={order.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              onClick={() => toggleExpand(order.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4f46e5' }}>
                {order.tableNumber}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>โต๊ะ {order.tableNumber}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{order.createdAt?.replace('T', ' ').slice(0, 16)}</p>
              </div>
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>฿{order.totalPrice.toFixed(0)}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{expanded === order.id ? '▲' : '▼'}</span>
            </div>

            {expanded === order.id && (
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px 16px' }}>
                {!items[order.id]
                  ? <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>กำลังโหลด...</p>
                  : items[order.id].length === 0
                    ? <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>ไม่มีรายการ</p>
                    : (
                      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#6b7280', fontWeight: 600 }}>รายการ</th>
                            <th style={{ textAlign: 'center', padding: '4px 8px', color: '#6b7280', fontWeight: 600 }}>จำนวน</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', color: '#6b7280', fontWeight: 600 }}>ราคา</th>
                            <th style={{ textAlign: 'center', padding: '4px 8px', color: '#6b7280', fontWeight: 600 }}>สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items[order.id].map(item => (
                            <tr key={item.id} style={{ borderTop: '1px solid #f8fafc' }}>
                              <td style={{ padding: '6px 8px' }}>{item.product_name}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'center' }}>x{item.quantity}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'right', color: '#4f46e5', fontWeight: 600 }}>฿{item.price.toFixed(0)}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                <span className={`status-badge status-${item.status}`}>
                                  {STATUS_LABEL[item.status] ?? item.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
