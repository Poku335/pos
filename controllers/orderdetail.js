const OrderDetail = require('../models/orderdetail');
const Product = require('../models/product');
const Order = require('../models/order');

// เพิ่มรายการสั่งใหม่
exports.addOrderItem = async (req, res) => {
  try {
    const { orderId, productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const orderItem = new OrderDetail({
      orderId,
      productId,
      quantity,
      price: product.price * quantity
    });
    await orderItem.save();

    // อัปเดตรวมราคาบิล
    const order = await Order.findById(orderId);
    order.totalPrice += orderItem.price;
    await order.save();

    res.status(201).json(orderItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// อัปเดตสถานะรายการสั่ง
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderItem = await OrderDetail.findById(id);
    if (!orderItem) return res.status(404).json({ message: 'Order item not found' });

    orderItem.status = status;
    await orderItem.save();

    res.status(200).json(orderItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ลบรายการสั่ง
exports.deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await OrderDetail.findByIdAndDelete(req.params.id);
    if (!orderItem) return res.status(404).json({ message: 'Order item not found' });

    res.status(200).json({ message: 'Order item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
