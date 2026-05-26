const express = require('express');
const { getOrders, openTable, closeTable } = require('../controllers/ordercontroller');
const router = express.Router();

router.get('/', getOrders);
router.post('/open', openTable);
router.put('/close/:id', closeTable);

module.exports = router;
