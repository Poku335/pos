const db = require('../config/db');

const Product = {
  findAll: () => {
    const rows = db.prepare(`
      SELECT p.id, p.name, p.description, p.price, p.image_type,
             c.id AS category_id, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `).all();
    return rows.map(formatRow);
  },

  findById: (id) => {
    const row = db.prepare(`
      SELECT p.id, p.name, p.description, p.price, p.image, p.image_type,
             c.id AS category_id, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);
    return row ? formatRow(row) : null;
  },

  findByIdRaw: (id) => db.prepare('SELECT * FROM products WHERE id = ?').get(id),

  create: ({ name, description, price, category_id, image, image_type }) => {
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO products (name, description, price, category_id, image, image_type) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, description ?? null, price, category_id ?? null, image ?? null, image_type ?? null);
    return Product.findById(lastInsertRowid);
  },

  update: (id, fields) => {
    const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!current) return null;
    db.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image = ?, image_type = ? WHERE id = ?'
    ).run(
      fields.name        ?? current.name,
      fields.description ?? current.description,
      fields.price       ?? current.price,
      fields.category_id ?? current.category_id,
      fields.image       ?? current.image,
      fields.image_type  ?? current.image_type,
      id
    );
    return Product.findById(id);
  },

  delete: (id) => db.prepare('DELETE FROM products WHERE id = ?').run(id).changes,
};

function formatRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_type: row.image_type,
    category: row.category_id ? { id: row.category_id, name: row.category_name } : null,
  };
}

module.exports = Product;
