const multer = require('multer');
const Product = require('../models/product');

const upload = multer({ storage: multer.memoryStorage() });
exports.upload = upload;

exports.addProduct = (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required' });

    const product = Product.create({
      name,
      description,
      price: parseFloat(price),
      category_id: category_id ? parseInt(category_id) : null,
      image: req.file?.buffer ?? null,
      image_type: req.file?.mimetype ?? null,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProducts = (req, res) => {
  try {
    res.json(Product.findAll());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductImage = (req, res) => {
  try {
    const row = Product.findByIdRaw(req.params.id);
    if (!row || !row.image) return res.status(404).json({ message: 'Image not found' });
    res.set('Content-Type', row.image_type || 'application/octet-stream');
    res.send(row.image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;
    const fields = {
      name,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      category_id: category_id !== undefined ? parseInt(category_id) : undefined,
      image: req.file?.buffer,
      image_type: req.file?.mimetype,
    };
    const product = Product.update(parseInt(req.params.id), fields);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    const deleted = Product.delete(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
