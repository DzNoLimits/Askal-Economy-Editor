const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Função utilitária para deserializar um item do banco
function parseItemRow(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    classname: row.classname,
    category_id: row.category_id,
    tier: JSON.parse(row.tier || '[1]'),
    nominal: row.nominal || 10,
    min: row.min || 5,
    lifetime: row.lifetime || 14400,
    restock: row.restock || 1800,
    quantmin: row.quantmin || 50,
    quantmax: row.quantmax || 80,
    price: row.price || 100,
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

// Função utilitária para validar dados de entrada
function validateItem(item) {
  const errors = [];
  
  if (!item.classname || item.classname.trim().length < 2) {
    errors.push('Classname é obrigatório e deve ter pelo menos 2 caracteres');
  }
  
  if (!item.category_id || isNaN(item.category_id)) {
    errors.push('Category ID é obrigatório e deve ser um número');
  }
  
  if (item.price !== undefined && (isNaN(item.price) || item.price < 0)) {
    errors.push('Price deve ser um número positivo');
  }
  
  if (item.nominal !== undefined && (isNaN(item.nominal) || item.nominal < 0)) {
    errors.push('Nominal deve ser um número positivo');
  }
  
  if (item.min !== undefined && (isNaN(item.min) || item.min < 0)) {
    errors.push('Min deve ser um número positivo');
  }
  
  return errors;
}

// Função utilitária para exportar dados consolidados para JSON
async function exportEconomyJson() {
  try {
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

    return {
      collections,
      categories,
      items,
      export_date: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    throw new Error(`Erro ao exportar dados: ${error.message}`);
  }
}

// ==================== COLLECTIONS ENDPOINTS ====================

// GET /api/collections - Lista todas as coleções
app.get('/api/collections', (req, res) => {
  db.all('SELECT * FROM collections ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar collections:', err);
      return res.status(500).json({ error: 'Erro ao buscar collections' });
    }
    res.json(rows);
  });
});

// GET /api/collections/:id - Detalhes de uma coleção
app.get('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM collections WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar collection:', err);
      return res.status(500).json({ error: 'Erro ao buscar collection' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(row);
  });
});

// POST /api/collections - Criar nova coleção
app.post('/api/collections', (req, res) => {
  const { name, display_name, description, icon, color } = req.body;
  
  if (!name || !display_name) {
    return res.status(400).json({ error: 'Name e display_name são obrigatórios' });
  }
  
  db.run(
    `INSERT INTO collections (name, display_name, description, icon, color) VALUES (?, ?, ?, ?, ?)`,
    [name, display_name, description || '', icon || '📁', color || '#4a90e2'],
    function (err) {
      if (err) {
        console.error('Erro ao criar collection:', err);
        return res.status(500).json({ error: 'Erro ao criar collection' });
      }
      res.json({ id: this.lastID, name, display_name, description, icon, color });
    }
  );
});

// PUT /api/collections/:id - Atualizar coleção
app.put('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  const { name, display_name, description, icon, color } = req.body;

  const sql = `UPDATE collections 
               SET name = ?, display_name = ?, description = ?, icon = ?, color = ?
               WHERE id = ?`;
  
  const params = [name, display_name, description, icon, color, id];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar collection:', err);
      return res.status(500).json({ error: 'Erro ao atualizar collection' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE /api/collections/:id - Deletar coleção
app.delete('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM collections WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar collection:', err);
      return res.status(500).json({ error: 'Erro ao deletar collection' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json({ message: 'Collection deleted successfully' });
  });
});

// ==================== CATEGORIES ENDPOINTS ====================

// GET /api/categories - Lista todas categorias
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar categories:', err);
      return res.status(500).json({ error: 'Erro ao buscar categories' });
    }
    
    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      collection_id: row.collection_id,
      item_count: row.item_count || 0,
      restock: row.restock,
      price: row.price,
      tier: row.tier,
      lifetime: row.lifetime,
      min: row.min,
      nominal: row.nominal,
      quantmin: row.quantmin,
      quantmax: row.quantmax,
      flags: JSON.parse(row.flags || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json(categories);
  });
});

// GET /api/categories/:id - Detalhes de uma categoria
app.get('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar category:', err);
      return res.status(500).json({ error: 'Erro ao buscar category' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const category = {
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      collection_id: row.collection_id,
      item_count: row.item_count || 0,
      restock: row.restock,
      price: row.price,
      tier: row.tier,
      lifetime: row.lifetime,
      min: row.min,
      nominal: row.nominal,
      quantmin: row.quantmin,
      quantmax: row.quantmax,
      flags: JSON.parse(row.flags || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
    
    res.json(category);
  });
});

// POST /api/categories - Criar nova categoria
app.post('/api/categories', (req, res) => {
  const { name, display_name, description, collection_id, item_count } = req.body;
  
  if (!name || !display_name) {
    return res.status(400).json({ error: 'Name e display_name são obrigatórios' });
  }
  
  db.run(
    `INSERT INTO categories (name, display_name, description, collection_id, item_count) VALUES (?, ?, ?, ?, ?)`,
    [name, display_name, description || '', collection_id, item_count || 0],
    function (err) {
      if (err) {
        console.error('Erro ao criar category:', err);
        return res.status(500).json({ error: 'Erro ao criar category' });
      }
      res.json({ id: this.lastID, name, display_name, description, collection_id, item_count: item_count || 0 });
    }
  );
});

// PUT /api/categories/:id - Atualizar categoria
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, display_name, description, collection_id, item_count, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags } = req.body;

  const sql = `UPDATE categories 
               SET name = ?, display_name = ?, description = ?, collection_id = ?, item_count = ?,
                   restock = ?, price = ?, tier = ?, lifetime = ?, 
                   min = ?, nominal = ?, quantmin = ?, quantmax = ?, flags = ?
               WHERE id = ?`;
  
  const params = [
    name, display_name, description, collection_id, item_count,
    restock, price, tier, lifetime,
    min, nominal, quantmin, quantmax,
    JSON.stringify(flags || {}), id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar category:', err);
      return res.status(500).json({ error: 'Erro ao atualizar category' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE /api/categories/:id - Deletar categoria
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar category:', err);
      return res.status(500).json({ error: 'Erro ao deletar category' });
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
  db.all('SELECT * FROM items ORDER BY classname', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar items:', err);
      return res.status(500).json({ error: 'Erro ao buscar items' });
    }
    const items = rows.map(parseItemRow);
    res.json(items);
  });
});

// GET /api/items/:id - Detalhes do item
app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar item:', err);
      return res.status(500).json({ error: 'Erro ao buscar item' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(parseItemRow(row));
  });
});

// POST /api/items - Criar novo item
app.post('/api/items', (req, res) => {
  const {
    classname, category_id, tier, nominal, min, lifetime, restock, quantmin, quantmax, price,
    flags, tags, usage, ammo_types, magazines, attachments, variants
  } = req.body;
  
  // Validar dados de entrada
  const validationErrors = validateItem({ classname, category_id, price, nominal, min });
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Dados inválidos', details: validationErrors });
  }
  
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
      if (err) {
        console.error('Erro ao criar item:', err);
        return res.status(500).json({ error: 'Erro ao criar item' });
      }
      // Retorne o objeto completo já deserializado
      db.get('SELECT * FROM items WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) {
          console.error('Erro ao buscar item criado:', err2);
          return res.status(500).json({ error: 'Erro ao buscar item criado' });
        }
        res.json(parseItemRow(row));
      });
    }
  );
});

// PUT /api/items/:id - Atualizar item
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const {
    classname, category_id, tier, price, lifetime, restock, min, nominal,
    quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments, variants
  } = req.body;
  
  // Validar dados de entrada
  const validationErrors = validateItem({ classname, category_id, price, nominal, min });
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: 'Dados inválidos', details: validationErrors });
  }
  
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
    if (err) {
      console.error('Erro ao atualizar item:', err);
      return res.status(500).json({ error: 'Erro ao atualizar item' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    db.get('SELECT * FROM items WHERE id = ?', [id], (err2, row) => {
      if (err2) {
        console.error('Erro ao buscar item atualizado:', err2);
        return res.status(500).json({ error: 'Erro ao buscar item atualizado' });
      }
      res.json(parseItemRow(row));
    });
  });
});

// DELETE /api/items/:id - Deletar item
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar item:', err);
      return res.status(500).json({ error: 'Erro ao deletar item' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// ==================== VARIANTS ENDPOINTS ====================

// GET /api/items/:id/variants - Listar variantes de um item
app.get('/api/items/:id/variants', (req, res) => {
  const { id } = req.params;
  
  db.all('SELECT * FROM variants WHERE item_id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar variants:', err);
      return res.status(500).json({ error: 'Erro ao buscar variants' });
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

// POST /api/items/:id/variants - Criar variante
app.post('/api/items/:id/variants', (req, res) => {
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
      console.error('Erro ao criar variant:', err);
      return res.status(500).json({ error: 'Erro ao criar variant' });
    }
    res.json({ id: this.lastID, item_id, ...req.body });
  });
});

// PUT /api/variants/:id - Atualizar variante
app.put('/api/variants/:id', (req, res) => {
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
      console.error('Erro ao atualizar variant:', err);
      return res.status(500).json({ error: 'Erro ao atualizar variant' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE /api/variants/:id - Deletar variante
app.delete('/api/variants/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM variants WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar variant:', err);
      return res.status(500).json({ error: 'Erro ao deletar variant' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ message: 'Variant deleted successfully' });
  });
});

// ==================== UTILITY ENDPOINTS ====================

// GET /api/export - Exportar todos os dados
app.get('/api/export', async (req, res) => {
  try {
    const data = await exportEconomyJson();
    res.json(data);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
