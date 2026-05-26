const db = require('../config/db');

const OrderDetail = {
  findById: (id) => db.prepare('SELECT * FROM order_details WHERE id = ?').get(id),

  findByOrder: (orderId) => db.prepare('SELECT * FROM order_details WHERE orderId = ?').all(orderId),

  create: ({ orderId, productId, quantity, price }) => {
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO order_details (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)'
    ).run(orderId, productId, quantity, price);
    return OrderDetail.findById(lastInsertRowid);
  },

  updateStatus: (id, status) => {
    db.prepare('UPDATE order_details SET status = ? WHERE id = ?').run(status, id);
    return OrderDetail.findById(id);
  },

  delete: (id) => db.prepare('DELETE FROM order_details WHERE id = ?').run(id).changes,
};

module.exports = OrderDetail;
