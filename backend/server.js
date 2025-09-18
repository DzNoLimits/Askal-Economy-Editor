const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ==================== CATEGORIES ENDPOINTS ====================

// GET /categories - Lista todas categorias
app.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse JSON fields
    const categories = rows.map(row => ({
      ...row,
      flags: JSON.parse(row.flags || '{}')
    }));
    res.json(categories);
  });
});

// GET /categories/:id - Detalhes de uma categoria
app.get('/categories/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Category not found' });
    }
    row.flags = JSON.parse(row.flags || '{}');
    res.json(row);
  });
});

// POST /categories - Criar nova categoria
app.post('/categories', (req, res) => {
  const { name, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = `INSERT INTO categories (name, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    name, restock || 0, price || 100, tier || 1, lifetime || 3888000,
    min || 0, nominal || 10, quantmin || -1, quantmax || -1,
    JSON.stringify(flags || {})
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, ...req.body });
  });
});

// PUT /categories/:id - Atualizar categoria
app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags } = req.body;

  const sql = `UPDATE categories 
               SET name = ?, restock = ?, price = ?, tier = ?, lifetime = ?, 
                   min = ?, nominal = ?, quantmin = ?, quantmax = ?, flags = ?
               WHERE id = ?`;
  
  const params = [
    name, restock, price, tier, lifetime,
    min, nominal, quantmin, quantmax,
    JSON.stringify(flags || {}), id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE /categories/:id - Deletar categoria
app.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  });
});

// ==================== ITEMS ENDPOINTS ====================

// GET /items - Lista todos itens
app.get('/items', (req, res) => {
  const { category_id } = req.query;
  let sql = 'SELECT * FROM items';
  const params = [];
  
  if (category_id) {
    sql += ' WHERE category_id = ?';
    params.push(category_id);
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse JSON fields
    const items = rows.map(row => ({
      ...row,
      flags: JSON.parse(row.flags || '{}'),
      tags: JSON.parse(row.tags || '[]'),
      usage: JSON.parse(row.usage || '[]'),
      ammo_types: JSON.parse(row.ammo_types || '[]'),
      magazines: JSON.parse(row.magazines || '[]'),
      attachments: JSON.parse(row.attachments || '[]')
    }));
    res.json(items);
  });
});

// GET /items/:id - Detalhes do item
app.get('/items/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Item not found' });
    }
    // Parse JSON fields
    row.flags = JSON.parse(row.flags || '{}');
    row.tags = JSON.parse(row.tags || '[]');
    row.usage = JSON.parse(row.usage || '[]');
    row.ammo_types = JSON.parse(row.ammo_types || '[]');
    row.magazines = JSON.parse(row.magazines || '[]');
    row.attachments = JSON.parse(row.attachments || '[]');
    res.json(row);
  });
});

// POST /items - Criar novo item
app.post('/items', (req, res) => {
  const { classname, category_id, tier, price, lifetime, restock, min, nominal, 
          quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments } = req.body;
  
  if (!classname || !category_id) {
    return res.status(400).json({ error: 'Classname and category_id are required' });
  }

  const sql = `INSERT INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, 
                                  quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    classname, category_id, tier || 1, price || 100, lifetime || 3888000,
    restock || 0, min || 0, nominal || 10, quantmin || -1, quantmax || -1,
    JSON.stringify(flags || {}), JSON.stringify(tags || []),
    JSON.stringify(usage || []), JSON.stringify(ammo_types || []),
    JSON.stringify(magazines || []), JSON.stringify(attachments || [])
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, ...req.body });
  });
});

// PUT /items/:id - Atualizar item
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { classname, category_id, tier, price, lifetime, restock, min, nominal,
          quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments } = req.body;

  const sql = `UPDATE items 
               SET classname = ?, category_id = ?, tier = ?, price = ?, lifetime = ?, 
                   restock = ?, min = ?, nominal = ?, quantmin = ?, quantmax = ?,
                   flags = ?, tags = ?, usage = ?, ammo_types = ?, magazines = ?, attachments = ?
               WHERE id = ?`;
  
  const params = [
    classname, category_id, tier, price, lifetime,
    restock, min, nominal, quantmin, quantmax,
    JSON.stringify(flags || {}), JSON.stringify(tags || []),
    JSON.stringify(usage || []), JSON.stringify(ammo_types || []),
    JSON.stringify(magazines || []), JSON.stringify(attachments || []), id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE /items/:id - Deletar item
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// ==================== VARIANTS ENDPOINTS ====================

// GET /items/:id/variants - Listar variantes de um item
app.get('/items/:id/variants', (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM variants WHERE item_id = ?', [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse JSON fields
    const variants = rows.map(row => ({
      ...row,
      flags: JSON.parse(row.flags || '{}'),
      tags: JSON.parse(row.tags || '[]'),
      usage: JSON.parse(row.usage || '[]'),
      ammo_types: JSON.parse(row.ammo_types || '[]'),
      magazines: JSON.parse(row.magazines || '[]'),
      attachments: JSON.parse(row.attachments || '[]')
    }));
    res.json(variants);
  });
});

// POST /items/:id/variants - Criar variante
app.post('/items/:id/variants', (req, res) => {
  const { id: item_id } = req.params;
  const { name, tier, price, lifetime, restock, min, nominal,
          quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = `INSERT INTO variants (item_id, name, tier, price, lifetime, restock, min, nominal, 
                                     quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    item_id, name, tier, price, lifetime,
    restock, min, nominal, quantmin, quantmax,
    JSON.stringify(flags || {}), JSON.stringify(tags || []),
    JSON.stringify(usage || []), JSON.stringify(ammo_types || []),
    JSON.stringify(magazines || []), JSON.stringify(attachments || [])
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, item_id, ...req.body });
  });
});

// PUT /variants/:id - Atualizar variante
app.put('/variants/:id', (req, res) => {
  const { id } = req.params;
  const { name, tier, price, lifetime, restock, min, nominal,
          quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments } = req.body;

  const sql = `UPDATE variants 
               SET name = ?, tier = ?, price = ?, lifetime = ?, restock = ?, 
                   min = ?, nominal = ?, quantmin = ?, quantmax = ?,
                   flags = ?, tags = ?, usage = ?, ammo_types = ?, magazines = ?, attachments = ?
               WHERE id = ?`;
  
  const params = [
    name, tier, price, lifetime, restock,
    min, nominal, quantmin, quantmax,
    JSON.stringify(flags || {}), JSON.stringify(tags || []),
    JSON.stringify(usage || []), JSON.stringify(ammo_types || []),
    JSON.stringify(magazines || []), JSON.stringify(attachments || []), id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE /variants/:id - Deletar variante
app.delete('/variants/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM variants WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ message: 'Variant deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
