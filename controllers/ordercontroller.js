const Order = require('../models/order');

// เปิดโต๊ะใหม่
exports.openTable = async (req, res) => {
  try {
    const newOrder = new Order({
      tableNumber: req.body.tableNumber,
      customerCount: req.body.customerCount
    });
    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ปิดบิล (รวมยอด)
exports.closeTable = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'closed';
    await order.save();
    res.status(200).json({ message: 'Table closed successfully', total: order.totalPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
