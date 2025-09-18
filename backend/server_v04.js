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

// Helper function to get item with all relationships
const getItemWithRelations = (itemId, callback) => {
  const query = `
    SELECT i.*, c.name as category_name FROM items i 
    JOIN categories c ON i.category_id = c.id 
    WHERE i.id = ?
  `;
  
  db.get(query, [itemId], (err, item) => {
    if (err || !item) return callback(err, null);
    
    const result = {
      id: item.id,
      classname: item.classname,
      category: item.category_name,
      category_id: item.category_id,
      nominal: item.nominal,
      min: item.min,
      quantmin: item.quantmin,
      quantmax: item.quantmax,
      tier: item.tier,
      price: item.price,
      lifetime: item.lifetime,
      restock: item.restock,
      flags: convertFlags(item),
      tags: [],
      usage: [],
      ammo_types: [],
      magazines: [],
      attachments: {},
      variants: []
    };
    
    let completed = 0;
    const total = 6; // número de queries
    
    // Tags
    db.all(`SELECT t.name FROM tags t 
            JOIN item_tags it ON t.id = it.tag_id 
            WHERE it.item_id = ?`, [itemId], (err, tags) => {
      if (!err) result.tags = tags.map(t => t.name);
      if (++completed === total) callback(null, result);
    });
    
    // Usage
    db.all(`SELECT u.name FROM usage_types u 
            JOIN item_usage iu ON u.id = iu.usage_id 
            WHERE iu.item_id = ?`, [itemId], (err, usage) => {
      if (!err) result.usage = usage.map(u => u.name);
      if (++completed === total) callback(null, result);
    });
    
    // Ammo types
    db.all(`SELECT a.name FROM ammo_types a 
            JOIN item_ammo_types iat ON a.id = iat.ammo_type_id 
            WHERE iat.item_id = ?`, [itemId], (err, ammo) => {
      if (!err) result.ammo_types = ammo.map(a => a.name);
      if (++completed === total) callback(null, result);
    });
    
    // Magazines
    db.all(`SELECT m.name FROM magazines m 
            JOIN item_magazines im ON m.id = im.magazine_id 
            WHERE im.item_id = ?`, [itemId], (err, mags) => {
      if (!err) result.magazines = mags.map(m => m.name);
      if (++completed === total) callback(null, result);
    });
    
    // Attachments (grouped by type)
    db.all(`SELECT a.name, at.name as type FROM attachments a 
            JOIN attachment_types at ON a.type_id = at.id
            JOIN item_attachments ia ON a.id = ia.attachment_id 
            WHERE ia.item_id = ?`, [itemId], (err, attachments) => {
      if (!err) {
        attachments.forEach(att => {
          if (!result.attachments[att.type]) result.attachments[att.type] = [];
          result.attachments[att.type].push(att.name);
        });
      }
      if (++completed === total) callback(null, result);
    });
    
    // Variants
    db.all(`SELECT * FROM variants WHERE item_id = ?`, [itemId], (err, variants) => {
      if (!err) {
        result.variants = variants.map(v => ({
          id: v.id,
          name: v.name,
          nominal: v.nominal,
          min: v.min,
          quantmin: v.quantmin,
          quantmax: v.quantmax,
          tier: v.tier,
          price: v.price,
          lifetime: v.lifetime,
          restock: v.restock,
          flags: convertFlags(v)
        }));
      }
      if (++completed === total) callback(null, result);
    });
  });
};

// ==================== CATEGORIES ENDPOINTS ====================

// GET /categories - Lista todas categorias
app.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
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

// POST /categories - Criar nova categoria
app.post('/categories', (req, res) => {
  const { name, flags, price, priority, lifetime, restock, min, nominal, quantmin, quantmax, tier } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = `INSERT INTO categories 
    (name, flag_events, flag_market, flag_p2p, flag_secure, flag_store, flag_dispatch,
     price, priority, lifetime, restock, min, nominal, quantmin, quantmax, tier) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    name, 
    flags?.Events ? 1 : 0, flags?.Market ? 1 : 0, flags?.P2P ? 1 : 0,
    flags?.Secure ? 1 : 0, flags?.Store ? 1 : 0, flags?.Dispatch ? 1 : 0,
    price || 100, priority || 100, lifetime || 86400, restock || 600,
    min || 1, nominal || 1, quantmin || -1, quantmax || -1, tier || 1
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, ...req.body });
  });
});

// PUT /categories/:id - Atualizar categoria
app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, flags, price, priority, lifetime, restock, min, nominal, quantmin, quantmax, tier } = req.body;
  
  const sql = `UPDATE categories SET 
    name = ?, flag_events = ?, flag_market = ?, flag_p2p = ?, flag_secure = ?, 
    flag_store = ?, flag_dispatch = ?, price = ?, priority = ?, lifetime = ?, 
    restock = ?, min = ?, nominal = ?, quantmin = ?, quantmax = ?, tier = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;
  
  const params = [
    name, 
    flags?.Events ? 1 : 0, flags?.Market ? 1 : 0, flags?.P2P ? 1 : 0,
    flags?.Secure ? 1 : 0, flags?.Store ? 1 : 0, flags?.Dispatch ? 1 : 0,
    price, priority, lifetime, restock, min, nominal, quantmin, quantmax, tier, id
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

// GET /items - Lista todos itens (com relacionamentos opcionais)
app.get('/items', (req, res) => {
  const { category_id, expand } = req.query;
  
  let query = `SELECT i.*, c.name as category_name FROM items i 
               JOIN categories c ON i.category_id = c.id`;
  let params = [];
  
  if (category_id) {
    query += ' WHERE i.category_id = ?';
    params.push(category_id);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (expand === 'true') {
      // Retornar itens com relacionamentos expandidos
      let completed = 0;
      const items = [];
      
      if (rows.length === 0) {
        return res.json([]);
      }
      
      rows.forEach(row => {
        getItemWithRelations(row.id, (err, item) => {
          if (!err) items.push(item);
          if (++completed === rows.length) {
            res.json(items);
          }
        });
      });
    } else {
      // Retornar itens simples
      const items = rows.map(row => ({
        id: row.id,
        classname: row.classname,
        category: row.category_name,
        category_id: row.category_id,
        nominal: row.nominal,
        min: row.min,
        quantmin: row.quantmin,
        quantmax: row.quantmax,
        tier: row.tier,
        price: row.price,
        lifetime: row.lifetime,
        restock: row.restock,
        flags: convertFlags(row)
      }));
      res.json(items);
    }
  });
});

// GET /items/:id - Detalhes de um item (com relacionamentos)
app.get('/items/:id', (req, res) => {
  const { id } = req.params;
  
  getItemWithRelations(id, (err, item) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  });
});

// POST /items - Criar novo item
app.post('/items', (req, res) => {
  const { classname, category_id, nominal, min, quantmin, quantmax, tier, 
          price, lifetime, restock, flags, tags, usage, ammo_types, magazines } = req.body;
  
  if (!classname || !category_id) {
    return res.status(400).json({ error: 'Classname and category_id are required' });
  }

  const sql = `INSERT INTO items 
    (classname, category_id, nominal, min, quantmin, quantmax, tier, price, lifetime, restock,
     flag_events, flag_market, flag_p2p, flag_secure, flag_store, flag_dispatch) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    classname, category_id, nominal, min, quantmin, quantmax, tier, price, lifetime, restock,
    flags?.Events ? 1 : 0, flags?.Market ? 1 : 0, flags?.P2P ? 1 : 0,
    flags?.Secure ? 1 : 0, flags?.Store ? 1 : 0, flags?.Dispatch ? 1 : 0
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const itemId = this.lastID;
    
    // TODO: Inserir relacionamentos (tags, usage, ammo_types, magazines)
    
    res.status(201).json({ id: itemId, ...req.body });
  });
});

// PUT /items/:id - Atualizar item
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { classname, category_id, nominal, min, quantmin, quantmax, tier, 
          price, lifetime, restock, flags } = req.body;
  
  const sql = `UPDATE items SET 
    classname = ?, category_id = ?, nominal = ?, min = ?, quantmin = ?, quantmax = ?, 
    tier = ?, price = ?, lifetime = ?, restock = ?, 
    flag_events = ?, flag_market = ?, flag_p2p = ?, flag_secure = ?, 
    flag_store = ?, flag_dispatch = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;
  
  const params = [
    classname, category_id, nominal, min, quantmin, quantmax, tier, price, lifetime, restock,
    flags?.Events ? 1 : 0, flags?.Market ? 1 : 0, flags?.P2P ? 1 : 0,
    flags?.Secure ? 1 : 0, flags?.Store ? 1 : 0, flags?.Dispatch ? 1 : 0, id
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

// GET /items/:id/variants - Lista variantes de um item
app.get('/items/:id/variants', (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM variants WHERE item_id = ?', [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const variants = rows.map(row => ({
      id: row.id,
      name: row.name,
      nominal: row.nominal,
      min: row.min,
      quantmin: row.quantmin,
      quantmax: row.quantmax,
      tier: row.tier,
      price: row.price,
      lifetime: row.lifetime,
      restock: row.restock,
      flags: convertFlags(row)
    }));
    
    res.json(variants);
  });
});

// POST /items/:id/variants - Criar nova variante
app.post('/items/:id/variants', (req, res) => {
  const { id } = req.params;
  const { name, nominal, min, quantmin, quantmax, tier, price, lifetime, restock, flags } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const sql = `INSERT INTO variants 
    (item_id, name, nominal, min, quantmin, quantmax, tier, price, lifetime, restock,
     flag_events, flag_market, flag_p2p, flag_secure, flag_store, flag_dispatch) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    id, name, nominal, min, quantmin, quantmax, tier, price, lifetime, restock,
    flags?.Events ? 1 : 0, flags?.Market ? 1 : 0, flags?.P2P ? 1 : 0,
    flags?.Secure ? 1 : 0, flags?.Store ? 1 : 0, flags?.Dispatch ? 1 : 0
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, item_id: id, ...req.body });
  });
});

// ==================== ATTACHMENTS ENDPOINTS ====================

// GET /items/:id/attachments - Lista attachments de um item
app.get('/items/:id/attachments', (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT a.name, at.name as type FROM attachments a 
                 JOIN attachment_types at ON a.type_id = at.id
                 JOIN item_attachments ia ON a.id = ia.attachment_id 
                 WHERE ia.item_id = ?`;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const attachments = {};
    rows.forEach(row => {
      if (!attachments[row.type]) attachments[row.type] = [];
      attachments[row.type].push(row.name);
    });
    
    res.json(attachments);
  });
});

// ==================== LOOKUP ENDPOINTS ====================

// GET /tags - Lista todas tags
app.get('/tags', (req, res) => {
  db.all('SELECT * FROM tags', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /usage - Lista todos usage types
app.get('/usage', (req, res) => {
  db.all('SELECT * FROM usage_types', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /ammo-types - Lista todos tipos de munição
app.get('/ammo-types', (req, res) => {
  db.all('SELECT * FROM ammo_types', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /magazines - Lista todos magazines
app.get('/magazines', (req, res) => {
  db.all('SELECT * FROM magazines', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /attachment-types - Lista tipos de attachments
app.get('/attachment-types', (req, res) => {
  db.all('SELECT * FROM attachment_types', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});