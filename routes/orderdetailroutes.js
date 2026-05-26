const express = require('express');
const { getByOrder, addOrderItem, updateOrderItemStatus, deleteOrderItem } = require('../controllers/orderdetail');
const router = express.Router();

router.get('/by-order/:orderId', getByOrder);
router.post('/add', addOrderItem);
router.put('/update-status/:id', updateOrderItemStatus);
router.delete('/:id', deleteOrderItem);

module.exports = router;
