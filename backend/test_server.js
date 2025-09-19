const express = require('express');
const db = require('./database');

const app = express();
const PORT = 3002; // Porta diferente para teste

app.use(express.json());

// Rota de teste simples
app.get('/test', (req, res) => {
    console.log('📡 Test route accessed');
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Rota de collections
app.get('/api/collections', (req, res) => {
    console.log('📡 Collections route accessed');
    
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
            console.error('❌ Database error:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        
        console.log(`✅ Found ${rows.length} collections`);
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`🧪 Test Server running on http://localhost:${PORT}`);
    console.log(`🔧 Test API: http://localhost:${PORT}/test`);
    console.log(`📊 Collections API: http://localhost:${PORT}/api/collections`);
});

module.exports = app;