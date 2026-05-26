const express = require('express');
const { addProduct, getProducts, getProductImage, updateProduct, deleteProduct, upload } = require('../controllers/productcontroller');
const router = express.Router();

router.post('/add', upload.single('image'), addProduct);
router.get('/', getProducts);
router.get('/:id/image', getProductImage);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
