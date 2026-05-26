const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'pos.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    price       REAL    NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    image       BLOB,
    image_type  TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tableNumber   INTEGER NOT NULL,
    customerCount INTEGER NOT NULL,
    status        TEXT    DEFAULT 'open',
    totalPrice    REAL    DEFAULT 0,
    createdAt     TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_details (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId   INTEGER NOT NULL REFERENCES orders(id),
    productId INTEGER NOT NULL REFERENCES products(id),
    quantity  INTEGER NOT NULL,
    price     REAL    NOT NULL,
    status    TEXT    DEFAULT 'pending'
  );
`);

module.exports = db;
