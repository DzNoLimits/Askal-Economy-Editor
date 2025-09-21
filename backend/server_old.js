const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to convert boolean flags
const convertFlags = (row) => {
  return {
    Events: Boolean(row.flag_events),
    Market: Boolean(row.flag_market),
    P2P: Boolean(row.flag_p2p),
    Secure: Boolean(row.flag_secure),
    Store: Boolean(row.flag_store),
    Dispatch: Boolean(row.flag_dispatch)
  };
};

// Função utilitária para deserializar um item do banco
function parseItemRow(row) {
  return {
    id: row.id,
    classname: row.classname,
    category_id: row.category_id,
    tier: JSON.parse(row.tier || '[1]'),
    nominal: row.nominal,
    min: row.min,
    lifetime: row.lifetime,
    restock: row.restock,
    quantmin: row.quantmin,
    quantmax: row.quantmax,
    price: row.price,
    flags: JSON.parse(row.flags || '{}'),
    tags: JSON.parse(row.tags || '[]'),
    usage: JSON.parse(row.usage || '[]'),
    ammo_types: JSON.parse(row.ammo_types || '[]'),
    magazines: JSON.parse(row.magazines || '[]'),
    attachments: JSON.parse(row.attachments || '{}'),
    variants: JSON.parse(row.variants || '{}'),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Função utilitária para exportar dados consolidados para JSON
async function exportEconomyJson() {
  // Exemplo: busca todas collections, categories e items
  const collections = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM collections', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const categories = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const items = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(parseItemRow));
    });
  });

  // Estrutura consolidada para exportação
  const exportJson = {
    collections,
    categories,
    items,
    // Adapte para o formato final desejado (types.xml, market.json, etc)
    // Exemplo para market.json:
    // MarketItems: items.map(item => ({ ... }))
    // Types: items.map(item => ({ ... }))
  };

  return exportJson;
}

// ==================== CATEGORIES ENDPOINTS ====================

// GET /api/categories - Lista todas categorias
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      flags: convertFlags(row),
      price: row.price,
      priority: row.priority,
      lifetime: row.lifetime,
      restock: row.restock,
      min: row.min,
      nominal: row.nominal,
      quantmin: row.quantmin,
      quantmax: row.quantmax,
      tier: row.tier,
      created_at: row.created_at,
      updated_at: row.updated_at
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
    
    const category = {
      id: row.id,
      name: row.name,
      flags: convertFlags(row),
      price: row.price,
      priority: row.priority,
      lifetime: row.lifetime,
      restock: row.restock,
      min: row.min,
      nominal: row.nominal,
      quantmin: row.quantmin,
      quantmax: row.quantmax,
      tier: row.tier,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    
    res.json(category);
  });
});

// POST /api/categories - Criar nova categoria
app.post('/api/categories', (req, res) => {
  const { name, display_name, description, collection_id, item_count } = req.body;
  db.run(
    `INSERT INTO categories (name, display_name, description, collection_id, item_count) VALUES (?, ?, ?, ?, ?)`,
    [name, display_name, description, collection_id, item_count || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, display_name, description, collection_id, item_count: item_count || 0 });
    }
  );
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

// GET /api/items - Lista todos itens
app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const items = rows.map(parseItemRow);
    res.json(items);
  });
});

// GET /items/:id - Detalhes do item
app.get('/items/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    res.json(parseItemRow(row));
  });
});

// POST /api/items - Criar novo item
app.post('/api/items', (req, res) => {
  const {
    classname, category_id, tier, nominal, min, lifetime, restock, quantmin, quantmax, price,
    flags, tags, usage, ammo_types, magazines, attachments, variants
  } = req.body;
  db.run(
    `INSERT INTO items (classname, category_id, tier, nominal, min, lifetime, restock, quantmin, quantmax, price,
      flags, tags, usage, ammo_types, magazines, attachments, variants)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      classname,
      category_id,
      JSON.stringify(tier ?? [1]),
      nominal ?? 10,
      min ?? 5,
      lifetime ?? 14400,
      restock ?? 3600,
      quantmin ?? 50,
      quantmax ?? 80,
      price ?? 100,
      JSON.stringify(flags ?? {}),
      JSON.stringify(tags ?? []),
      JSON.stringify(usage ?? []),
      JSON.stringify(ammo_types ?? []),
      JSON.stringify(magazines ?? []),
      JSON.stringify(attachments ?? {}),
      JSON.stringify(variants ?? {})
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      // Retorne o objeto completo já deserializado
      db.get('SELECT * FROM items WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(parseItemRow(row));
      });
    }
  );
});

// PUT /items/:id - Atualizar item
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const {
    classname, category_id, tier, price, lifetime, restock, min, nominal,
    quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments, variants
  } = req.body;
  const sql = `UPDATE items
    SET classname = ?, category_id = ?, tier = ?, price = ?, lifetime = ?,
        restock = ?, min = ?, nominal = ?, quantmin = ?, quantmax = ?,
        flags = ?, tags = ?, usage = ?, ammo_types = ?, magazines = ?, attachments = ?, variants = ?
    WHERE id = ?`;
  const params = [
    classname,
    category_id,
    JSON.stringify(tier ?? [1]),
    price,
    lifetime,
    restock,
    min,
    nominal,
    quantmin,
    quantmax,
    JSON.stringify(flags ?? {}),
    JSON.stringify(tags ?? []),
    JSON.stringify(usage ?? []),
    JSON.stringify(ammo_types ?? []),
    JSON.stringify(magazines ?? []),
    JSON.stringify(attachments ?? {}),
    JSON.stringify(variants ?? {}),
    id
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
    db.get('SELECT * FROM items WHERE id = ?', [id], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(parseItemRow(row));
    });
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

// ==================== COLLECTIONS ENDPOINTS ====================

// GET /api/collections - Lista todas as coleções
app.get('/api/collections', (req, res) => {
  db.all('SELECT * FROM collections', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/collections - Criar nova coleção
app.post('/api/collections', (req, res) => {
  const { name, display_name, description, icon, color } = req.body;
  db.run(
    `INSERT INTO collections (name, display_name, description, icon, color) VALUES (?, ?, ?, ?, ?)`,
    [name, display_name, description, icon, color],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Repita para categories e items (GET/POST/PUT)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
