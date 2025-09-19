const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logs de debug das rotas API
app.use('/api/*', (req, res, next) => {
    console.log(`📡 API Request: ${req.method} ${req.originalUrl}`);
    next();
});

// Servir arquivos estáticos do frontend (quando compilado)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ===== API ROUTES V2 (Collections -> Categories -> Items -> Variants) =====

// Collections
app.get('/api/collections', (req, res) => {
    const query = `
        SELECT c.*, 
               COUNT(cat.id) as category_count,
               COUNT(i.id) as item_count
        FROM collections c 
        LEFT JOIN categories cat ON c.id = cat.collection_id 
        LEFT JOIN items i ON cat.id = i.category_id
        GROUP BY c.id 
        ORDER BY c.name
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Categories by collection
app.get('/api/collections/:id/categories', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT cat.*, 
               col.name as collection_name,
               col.display_name as collection_display_name,
               COUNT(i.id) as item_count
        FROM categories cat 
        JOIN collections col ON cat.collection_id = col.id
        LEFT JOIN items i ON cat.id = i.category_id
        WHERE cat.collection_id = ?
        GROUP BY cat.id
        ORDER BY cat.sort_order, cat.display_name
    `;
    
    db.all(query, [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Items by category with optional expansion
app.get('/api/categories/:id/items', (req, res) => {
    const { id } = req.params;
    const { expand } = req.query;

    let query = `
        SELECT i.*, 
               cat.name as category_name,
               cat.display_name as category_display_name,
               col.name as collection_name,
               col.display_name as collection_display_name
        FROM items i 
        JOIN categories cat ON i.category_id = cat.id
        JOIN collections col ON cat.collection_id = col.id
        WHERE i.category_id = ?
        ORDER BY i.sort_order, i.display_name
    `;

    db.all(query, [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (expand === 'variants') {
            // Para cada item, buscar suas variants
            const promises = rows.map(item => {
                return new Promise((resolve, reject) => {
                    const variantQuery = 'SELECT * FROM variants WHERE item_id = ? ORDER BY sort_order, display_name';
                    db.all(variantQuery, [item.id], (err, variants) => {
                        if (err) {
                            reject(err);
                        } else {
                            item.variants = variants;
                            resolve(item);
                        }
                    });
                });
            });

            Promise.all(promises)
                .then(itemsWithVariants => {
                    res.json(itemsWithVariants);
                })
                .catch(error => {
                    res.status(500).json({ error: error.message });
                });
        } else {
            res.json(rows);
        }
    });
});

// Variants by item
app.get('/api/items/:id/variants', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT v.*,
               i.classname as item_classname,
               i.display_name as item_display_name
        FROM variants v
        JOIN items i ON v.item_id = i.id
        WHERE v.item_id = ?
        ORDER BY v.sort_order, v.display_name
    `;
    
    db.all(query, [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single item with all related data
app.get('/api/items/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT i.*,
               cat.name as category_name,
               cat.display_name as category_display_name,
               col.id as collection_id,
               col.name as collection_name,
               col.display_name as collection_display_name
        FROM items i
        JOIN categories cat ON i.category_id = cat.id
        JOIN collections col ON cat.collection_id = col.id
        WHERE i.id = ?
    `;
    
    db.get(query, [id], (err, item) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        
        // Buscar variants do item
        const variantQuery = 'SELECT * FROM variants WHERE item_id = ? ORDER BY sort_order, display_name';
        db.all(variantQuery, [id], (err, variants) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            item.variants = variants;
            res.json(item);
        });
    });
});

// CREATE Operations

// Create collection
app.post('/api/collections', (req, res) => {
    const { name, display_name, description, icon, color } = req.body;
    
    const query = `
        INSERT INTO collections (name, display_name, description, icon, color)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [name, display_name, description, icon, color], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Collection created successfully' });
    });
});

// Create category
app.post('/api/categories', (req, res) => {
    const { collection_id, name, display_name, description, sort_order } = req.body;
    
    const query = `
        INSERT INTO categories (collection_id, name, display_name, description, sort_order)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [collection_id, name, display_name, description, sort_order || 0], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Category created successfully' });
    });
});

// Create item
app.post('/api/items', (req, res) => {
    const {
        category_id, classname, display_name, description, tier, price, lifetime,
        restock, min, nominal, quantmin, quantmax, flags, tags, usage, value,
        ammo_types, magazines, attachments, image_url, sort_order
    } = req.body;
    
    const query = `
        INSERT INTO items (
            category_id, classname, display_name, description, tier, price, lifetime,
            restock, min, nominal, quantmin, quantmax, flags, tags, usage, value,
            ammo_types, magazines, attachments, image_url, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        category_id, classname, display_name, description, tier || 1, price || 100,
        lifetime || 3888000, restock || 0, min || 0, nominal || 10, quantmin || -1,
        quantmax || -1, flags || '{}', tags || '[]', usage || '[]', value || '[]',
        ammo_types || '[]', magazines || '[]', attachments || '[]', image_url,
        sort_order || 0
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Item created successfully' });
    });
});

// Create variant
app.post('/api/variants', (req, res) => {
    const {
        item_id, name, display_name, description, tier, price, lifetime, restock,
        min, nominal, quantmin, quantmax, flags, tags, usage, value, rarity, sort_order
    } = req.body;
    
    const query = `
        INSERT INTO variants (
            item_id, name, display_name, description, tier, price, lifetime, restock,
            min, nominal, quantmin, quantmax, flags, tags, usage, value, rarity, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
        item_id, name, display_name, description, tier, price, lifetime, restock,
        min, nominal, quantmin, quantmax, flags, tags, usage, value, rarity || 'common',
        sort_order || 0
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Variant created successfully' });
    });
});

// UPDATE Operations

// Update item
app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    
    // Construir query dinamicamente baseado nos campos fornecidos
    const updateFields = [];
    const values = [];
    
    Object.keys(fields).forEach(field => {
        if (field !== 'id') {
            updateFields.push(`${field} = ?`);
            values.push(fields[field]);
        }
    });
    
    if (updateFields.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }
    
    values.push(id);
    const query = `UPDATE items SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(query, values, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Item updated successfully', changes: this.changes });
    });
});

// Update variant
app.put('/api/variants/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    
    const updateFields = [];
    const values = [];
    
    Object.keys(fields).forEach(field => {
        if (field !== 'id') {
            updateFields.push(`${field} = ?`);
            values.push(fields[field]);
        }
    });
    
    if (updateFields.length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }
    
    values.push(id);
    const query = `UPDATE variants SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(query, values, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Variant updated successfully', changes: this.changes });
    });
});

// DELETE Operations
app.delete('/api/collections/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM collections WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Collection deleted successfully', changes: this.changes });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Category deleted successfully', changes: this.changes });
    });
});

app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Item deleted successfully', changes: this.changes });
    });
});

app.delete('/api/variants/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM variants WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Variant deleted successfully', changes: this.changes });
    });
});

// Servir o frontend React para todas as outras rotas (DEVE SER A ÚLTIMA ROTA)
app.get('*', (req, res) => {
    // Verificar se é uma rota da API que não foi encontrada
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
    console.log(`📦 Serving frontend from: ${path.join(__dirname, '../frontend/build')}`);
    console.log(`🔧 API available at: http://localhost:${PORT}/api/*`);
    console.log(`📊 New Structure: Collections -> Categories -> Items -> Variants`);
});

module.exports = app;