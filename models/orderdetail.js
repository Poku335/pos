const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'served', 'cancelled'], //รอดำเนินการ, กําลังเตรียม, เสิร์ฟ ,ยกเลิก
    default: 'pending' 
  }
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
