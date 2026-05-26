const db = require('../config/db');

const Order = {
  findAll: () => db.prepare('SELECT * FROM orders').all(),

  findById: (id) => db.prepare('SELECT * FROM orders WHERE id = ?').get(id),

  create: ({ tableNumber, customerCount }) => {
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO orders (tableNumber, customerCount) VALUES (?, ?)'
    ).run(tableNumber, customerCount);
    return Order.findById(lastInsertRowid);
  },

  close: (id) => {
    db.prepare("UPDATE orders SET status = 'closed' WHERE id = ?").run(id);
    return Order.findById(id);
  },

  addToTotal: (id, amount) => {
    db.prepare('UPDATE orders SET totalPrice = totalPrice + ? WHERE id = ?').run(amount, id);
  },
};

module.exports = Order;
