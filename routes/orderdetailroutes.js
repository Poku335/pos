const express = require('express');
const { addOrderItem, updateOrderItemStatus, deleteOrderItem } = require('../controllers/orderDetailController');
const router = express.Router();

router.post('/add', addOrderItem); // เพิ่มรายการสั่งใหม่
router.put('/update-status/:id', updateOrderItemStatus); // อัปเดตสถานะของรายการสั่ง
router.delete('/:id', deleteOrderItem); // ลบรายการสั่ง

module.exports = router;
