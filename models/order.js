const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true }, // หมายเลขโต๊ะ
  customerCount: { type: Number, required: true }, // จำนวนลูกค้าในโต๊ะ
  status: { type: String, default: 'open' }, // สถานะบิล: open หรือ closed
  totalPrice: { type: Number, default: 0 }, // ยอดรวมทั้งหมด
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
