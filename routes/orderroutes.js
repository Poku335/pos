const express = require('express');
const { openTable, closeTable } = require('../controllers/ordercontroller');
const router = express.Router();

router.post('/open', openTable); // เปิดโต๊ะใหม่
router.put('/close/:id', closeTable); // ปิดบิล

module.exports = router;
