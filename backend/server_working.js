const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs de debug
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log(`📡 API Request: ${req.method} ${req.path}`);
    }
    next();
});

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ===== API ROUTES =====

// Collections
app.get('/api/collections', (req, res) => {
    console.log('📊 Fetching collections...');
    
    const query = `
        SELECT c.*, 
               COUNT(DISTINCT cat.id) as category_count,
               COUNT(DISTINCT i.id) as item_count
        FROM collections c 
        LEFT JOIN categories cat ON c.id = cat.collection_id 
        LEFT JOIN items i ON cat.id = i.category_id
        GROUP BY c.id 
        ORDER BY c.name
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log(`✅ Returning ${rows.length} collections`);
        res.json(rows);
    });
});

// Categories by collection
app.get('/api/collections/:id/categories', (req, res) => {
    const { id } = req.params;
    console.log(`📂 Fetching categories for collection ${id}...`);
    
    const query = `
        SELECT cat.*, 
               col.name as collection_name,
               col.display_name as collection_display_name,
               COUNT(DISTINCT i.id) as item_count
        FROM categories cat 
        JOIN collections col ON cat.collection_id = col.id
        LEFT JOIN items i ON cat.id = i.category_id
        WHERE cat.collection_id = ?
        GROUP BY cat.id
        ORDER BY cat.sort_order, cat.display_name
    `;
    
    db.all(query, [id], (err, rows) => {
        if (err) {
            console.error('❌ Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log(`✅ Returning ${rows.length} categories for collection ${id}`);
        res.json(rows);
    });
});

// Items by category
app.get('/api/categories/:id/items', (req, res) => {
    const { id } = req.params;
    const { expand } = req.query;
    console.log(`📄 Fetching items for category ${id}...`);

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
            console.error('❌ Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }

        console.log(`✅ Returning ${rows.length} items for category ${id}`);
        
        if (expand === 'variants' && rows.length > 0) {
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'DayZ Economy Editor API v2.0' 
    });
});

// Servir frontend React para todas as outras rotas
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 DayZ Economy Editor v2.0 running on http://localhost:${PORT}`);
    console.log(`📦 Serving frontend from: ${path.join(__dirname, '../frontend/build')}`);
    console.log(`🔧 API available at: http://localhost:${PORT}/api/*`);
    console.log(`📊 Structure: Collections -> Categories -> Items -> Variants`);
});

module.exports = app;