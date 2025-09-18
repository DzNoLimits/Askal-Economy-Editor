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

// Servir arquivos estáticos do frontend (quando compilado)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ===== API ROUTES (mesmas da v0.4) =====

// Categories
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM categories ORDER BY name';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Items with optional expansion
app.get('/api/items', (req, res) => {
    const { category_id, expand } = req.query;

    let query = 'SELECT i.*, c.name as category FROM items i JOIN categories c ON i.category_id = c.id';
    let params = [];

    if (category_id) {
        query += ' WHERE i.category_id = ?';
        params.push(category_id);
    }

    query += ' ORDER BY i.classname';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (expand === 'true' && rows.length > 0) {
            // Expandir dados para todos os itens
            const promises = rows.map(item => expandItemData(item));
            Promise.all(promises)
                .then(expandedItems => res.json(expandedItems))
                .catch(error => res.status(500).json({ error: error.message }));
        } else {
            res.json(rows);
        }
    });
});

// Single item with expansion
app.get('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const { expand } = req.query;

    const query = 'SELECT i.*, c.name as category FROM items i JOIN categories c ON i.category_id = c.id WHERE i.id = ?';

    db.get(query, [id], (err, item) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        if (expand === 'true') {
            expandItemData(item)
                .then(expandedItem => res.json(expandedItem))
                .catch(error => res.status(500).json({ error: error.message }));
        } else {
            res.json(item);
        }
    });
});

// Função para expandir dados do item
function expandItemData(item) {
    return new Promise((resolve, reject) => {
        const promises = [
            // Tags
            new Promise((res, rej) => {
                db.all('SELECT t.name FROM tags t JOIN item_tags it ON t.id = it.tag_id WHERE it.item_id = ?',
                    [item.id], (err, rows) => err ? rej(err) : res(rows.map(r => r.name)));
            }),
            // Usage
            new Promise((res, rej) => {
                db.all('SELECT u.name FROM usage_types u JOIN item_usage iu ON u.id = iu.usage_id WHERE iu.item_id = ?',
                    [item.id], (err, rows) => err ? rej(err) : res(rows.map(r => r.name)));
            }),
            // Ammo Types
            new Promise((res, rej) => {
                db.all('SELECT a.name FROM ammo_types a JOIN item_ammo_types iat ON a.id = iat.ammo_type_id WHERE iat.item_id = ?',
                    [item.id], (err, rows) => err ? rej(err) : res(rows.map(r => r.name)));
            }),
            // Magazines
            new Promise((res, rej) => {
                db.all('SELECT m.name FROM magazines m JOIN item_magazines im ON m.id = im.magazine_id WHERE im.item_id = ?',
                    [item.id], (err, rows) => err ? rej(err) : res(rows.map(r => r.name)));
            }),
            // Attachments
            new Promise((res, rej) => {
                db.all(`SELECT a.name, at.name as type FROM attachments a 
                JOIN attachment_types at ON a.type_id = at.id
                JOIN item_attachments ia ON a.id = ia.attachment_id 
                WHERE ia.item_id = ?`,
                    [item.id], (err, rows) => {
                        if (err) rej(err);
                        else {
                            const grouped = {};
                            rows.forEach(att => {
                                if (!grouped[att.type]) grouped[att.type] = [];
                                grouped[att.type].push(att.name);
                            });
                            res(grouped);
                        }
                    });
            }),
            // Variants
            new Promise((res, rej) => {
                db.all('SELECT * FROM variants WHERE item_id = ?',
                    [item.id], (err, rows) => err ? rej(err) : res(rows));
            })
        ];

        Promise.all(promises)
            .then(([tags, usage, ammo_types, magazines, attachments, variants]) => {
                resolve({
                    ...item,
                    flags: {
                        Events: Boolean(item.flag_events),
                        Market: Boolean(item.flag_market),
                        P2P: Boolean(item.flag_p2p),
                        Secure: Boolean(item.flag_secure),
                        Store: Boolean(item.flag_store),
                        Dispatch: Boolean(item.flag_dispatch)
                    },
                    tags,
                    usage,
                    ammo_types,
                    magazines,
                    attachments,
                    variants
                });
            })
            .catch(reject);
    });
}

// Todas as outras rotas da API v0.4...
app.get('/api/tags', (req, res) => {
    db.all('SELECT * FROM tags ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/usage', (req, res) => {
    db.all('SELECT * FROM usage_types ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/ammo-types', (req, res) => {
    db.all('SELECT * FROM ammo_types ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/magazines', (req, res) => {
    db.all('SELECT * FROM magazines ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/attachment-types', (req, res) => {
    db.all('SELECT * FROM attachment_types ORDER BY name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/attachments', (req, res) => {
    const query = `
    SELECT a.*, at.name as type_name 
    FROM attachments a 
    JOIN attachment_types at ON a.type_id = at.id 
    ORDER BY at.name, a.name
  `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/variants', (req, res) => {
    const { item_id } = req.query;

    let query = 'SELECT * FROM variants';
    let params = [];

    if (item_id) {
        query += ' WHERE item_id = ?';
        params.push(item_id);
    }

    query += ' ORDER BY name';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Rota catch-all para React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
    console.log(`📦 Serving frontend from: ${path.join(__dirname, '../frontend/build')}`);
    console.log(`🔧 API available at: http://localhost:${PORT}/api/*`);
});

module.exports = app;