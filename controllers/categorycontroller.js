const Category = require('../models/category');

exports.addCategory = (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    res.status(201).json(Category.create(name));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCategories = (req, res) => {
  try {
    res.json(Category.findAll());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = (req, res) => {
  try {
    const { name } = req.body;
    const category = Category.update(parseInt(req.params.id), name);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCategory = (req, res) => {
  try {
    const deleted = Category.delete(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
