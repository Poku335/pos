const db = require('../config/db');
const OrderDetail = require('../models/orderdetail');
const Product = require('../models/product');
const Order = require('../models/order');

exports.getByOrder = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT od.*, p.name AS product_name
      FROM order_details od
      JOIN products p ON od.productId = p.id
      WHERE od.orderId = ?
    `).all(parseInt(req.params.orderId));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addOrderItem = (req, res) => {
  try {
    const { orderId, productId, quantity } = req.body;
    const product = Product.findByIdRaw(parseInt(productId));
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const price = product.price * quantity;
    const item = OrderDetail.create({ orderId: parseInt(orderId), productId: parseInt(productId), quantity, price });
    Order.addToTotal(parseInt(orderId), price);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateOrderItemStatus = (req, res) => {
  try {
    const item = OrderDetail.updateStatus(parseInt(req.params.id), req.body.status);
    if (!item) return res.status(404).json({ message: 'Order item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrderItem = (req, res) => {
  try {
    const deleted = OrderDetail.delete(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Order item not found' });
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
