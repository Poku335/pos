const db = require('../config/db');

const Category = {
  findAll: () => db.prepare('SELECT * FROM categories').all(),

  findById: (id) => db.prepare('SELECT * FROM categories WHERE id = ?').get(id),

  create: (name) => {
    const { lastInsertRowid } = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    return Category.findById(lastInsertRowid);
  },

  update: (id, name) => {
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
    return Category.findById(id);
  },

  delete: (id) => db.prepare('DELETE FROM categories WHERE id = ?').run(id).changes,
};

module.exports = Category;
