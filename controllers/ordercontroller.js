const Order = require('../models/order');

exports.getOrders = (req, res) => {
  try {
    res.json(Order.findAll());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.openTable = (req, res) => {
  try {
    const { tableNumber, customerCount } = req.body;
    if (!tableNumber || !customerCount) return res.status(400).json({ error: 'tableNumber and customerCount are required' });
    res.status(201).json(Order.create({ tableNumber, customerCount }));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.closeTable = (req, res) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const closed = Order.close(order.id);
    res.json({ message: 'Table closed successfully', total: closed.totalPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
