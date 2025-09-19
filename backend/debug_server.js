const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3003;

// CORS mais permissivo para debug
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log todas as requisições
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
    console.log('✅ Test endpoint hit!');
    res.json({ 
        success: true, 
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Rota de collections mockada para teste
app.get('/api/collections', (req, res) => {
    console.log('📊 Collections endpoint hit!');
    console.log('📡 Request headers:', req.headers);
    
    const mockCollections = [
        {
            id: 1,
            name: 'weapons',
            display_name: 'Weapons',
            description: 'Combat and hunting weapons',
            icon: '🔫',
            color: '#e74c3c',
            category_count: 1,
            item_count: 15
        },
        {
            id: 2,
            name: 'tools',
            display_name: 'Tools',
            description: 'Utility and survival tools',
            icon: '🔧',
            color: '#f39c12',
            category_count: 1,
            item_count: 12
        },
        {
            id: 3,
            name: 'clothes',
            display_name: 'Clothes',
            description: 'Clothing and protective gear',
            icon: '👕',
            color: '#9b59b6',
            category_count: 1,
            item_count: 20
        },
        {
            id: 4,
            name: 'containers',
            display_name: 'Containers',
            description: 'Storage containers and bags',
            icon: '🎒',
            color: '#3498db',
            category_count: 1,
            item_count: 8
        },
        {
            id: 5,
            name: 'food',
            display_name: 'Food',
            description: 'Food and consumables',
            icon: '🍖',
            color: '#27ae60',
            category_count: 1,
            item_count: 25
        },
        {
            id: 6,
            name: 'books',
            display_name: 'Books',
            description: 'Books and documents',
            icon: '📚',
            color: '#8e44ad',
            category_count: 1,
            item_count: 6
        },
        {
            id: 7,
            name: 'explosives',
            display_name: 'Explosives',
            description: 'Explosive devices and materials',
            icon: '💥',
            color: '#e67e22',
            category_count: 1,
            item_count: 4
        },
        {
            id: 8,
            name: 'lootdispatch',
            display_name: 'Loot Dispatch',
            description: 'Special loot dispatch items',
            icon: '�',
            color: '#95a5a6',
            category_count: 1,
            item_count: 3
        }
    ];
    
    console.log(`✅ Sending ${mockCollections.length} collections`);
    res.header('Content-Type', 'application/json');
    res.json(mockCollections);
});

// Rota de categories mockada para teste
app.get('/api/collections/:collectionId/categories', (req, res) => {
    const { collectionId } = req.params;
    console.log(`📂 Categories endpoint hit for collection: ${collectionId}`);
    
    // Categorias mockadas baseadas na coleção
    let mockCategories = [];
    
    // Mapeamento direto das collections para categorias
    const categoryMap = {
        1: { name: 'weapons', display_name: 'Weapons', description: 'Combat and hunting weapons', item_count: 15 },
        2: { name: 'tools', display_name: 'Tools', description: 'Utility and survival tools', item_count: 12 },
        3: { name: 'clothes', display_name: 'Clothes', description: 'Clothing and protective gear', item_count: 20 },
        4: { name: 'containers', display_name: 'Containers', description: 'Storage containers and bags', item_count: 8 },
        5: { name: 'food', display_name: 'Food', description: 'Food and consumables', item_count: 25 },
        6: { name: 'books', display_name: 'Books', description: 'Books and documents', item_count: 6 },
        7: { name: 'explosives', display_name: 'Explosives', description: 'Explosive devices and materials', item_count: 4 },
        8: { name: 'lootdispatch', display_name: 'Loot Dispatch', description: 'Special loot dispatch items', item_count: 3 }
    };

    if (categoryMap[collectionId]) {
        const category = categoryMap[collectionId];
        mockCategories = [
            {
                id: parseInt(collectionId),
                name: category.name,
                display_name: category.display_name,
                description: category.description,
                collection_id: parseInt(collectionId),
                item_count: category.item_count
            }
        ];
    }
    
    console.log(`✅ Sending ${mockCategories.length} categories for collection ${collectionId}`);
    res.header('Content-Type', 'application/json');
    res.json(mockCategories);
});

// Rota de items mockada para teste
app.get('/api/categories/:categoryId/items', (req, res) => {
    const { categoryId } = req.params;
    const expand = req.query.expand;
    console.log(`📄 Items endpoint hit for category: ${categoryId}, expand: ${expand}`);
    
    // Items mockados baseados na categoria
    let mockItems = [];
    
    if (categoryId == 1) { // Assault Rifles
        mockItems = [
            {
                id: 1,
                classname: 'M4A1',
                display_name: 'M4A1 Carbine',
                category_id: 1,
                tier: 4,
                tiers: [3, 4],
                nominal: 85,
                min: 40,
                lifetime: 168, // 1 semana
                restock: 0,
                price: 1500,
                quantmin: -1,
                quantmax: -1,
                flags: {
                    count_in_cargo: 0,
                    count_in_hoarder: 0,
                    count_in_map: 1,
                    count_in_player: 0,
                    crafted: 0,
                    deloot: 0
                },
                tags: ['floor', 'shelves'],
                usage: ['Military', 'Police'],
                ammo_types: ['Ammo_556x45'],
                magazines: ['Mag_STANAG_30Rnd', 'Mag_STANAG_60Rnd'],
                attachments: ['M4_Suppressor', 'M4_OEBttstck'],
                variants: [
                    { id: 1, name: 'Black', display_name: 'Black M4A1' },
                    { id: 2, name: 'Green', display_name: 'Green M4A1' }
                ]
            },
            {
                id: 2,
                classname: 'AKM',
                display_name: 'AKM Rifle',
                category_id: 1,
                tier: 3,
                tiers: [2, 3],
                nominal: 75,
                min: 35,
                lifetime: 72, // 3 dias
                restock: 0,
                price: 1200,
                quantmin: -1,
                quantmax: -1,
                flags: {
                    count_in_cargo: 0,
                    count_in_hoarder: 0,
                    count_in_map: 1,
                    count_in_player: 0,
                    crafted: 0,
                    deloot: 0
                },
                tags: ['floor'],
                usage: ['Military', 'Hunting'],
                ammo_types: ['Ammo_762x39'],
                magazines: ['Mag_AK74_30Rnd'],
                attachments: ['AK_Suppressor', 'AK_WoodBttstck'],
                variants: [
                    { id: 3, name: 'Wood', display_name: 'Wooden AKM' },
                    { id: 4, name: 'Black', display_name: 'Black AKM' }
                ]
            }
        ];
    } else if (categoryId == 4) { // Repair Tools
        mockItems = [
            {
                id: 10,
                classname: 'Wrench',
                display_name: 'Pipe Wrench',
                category_id: 4,
                tier: 2,
                tiers: [1, 2],
                nominal: 80,
                min: 40,
                lifetime: 24, // 1 dia
                variants: []
            }
        ];
    }
    
    console.log(`✅ Sending ${mockItems.length} items for category ${categoryId}`);
    res.header('Content-Type', 'application/json');
    res.json(mockItems);
});

// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🧪 Debug Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔧 Test API: http://0.0.0.0:${PORT}/api/test`);
    console.log(`📊 Collections API: http://0.0.0.0:${PORT}/api/collections`);
    console.log(`🌐 Frontend: http://0.0.0.0:${PORT}`);
    console.log(`📱 Access from network: http://[YOUR_IP]:${PORT}`);
});