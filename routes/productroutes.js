// routes/productRoutes.js
const express = require('express');
const { addProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productcontroller');
const router = express.Router();

router.post('/add', addProduct); // เพิ่มสินค้าใหม่
router.get('/', getProducts); // ดึงรายการสินค้าทั้งหมด
router.put('/:id', updateProduct); // อัปเดต
router.delete('/:id', deleteProduct); // ลบสินค้า

module.exports = router;
