const express = require('express');
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categorycontroller');
const router = express.Router();

router.post('/add', addCategory); // เพิ่ม Category ใหม่
router.get('/', getCategories);    // ดึงรายการ Category ทั้งหมด
router.put('/:id', updateCategory); // อัปเดต Category
router.delete('/:id', deleteCategory); // ลบ Category

module.exports = router;
