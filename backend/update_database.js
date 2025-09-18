const db = require('./database');

console.log('🔄 Atualizando database com categorias do DayZ...\n');

// Limpar dados antigos
console.log('🗑️ Limpando dados antigos...');
db.run('DELETE FROM categories');
db.run('DELETE FROM tags');
db.run('DELETE FROM usage_types');
db.run('DELETE FROM items');

// Inserir categorias corretas do DayZ
console.log('📂 Inserindo categorias do cfglimitsdefinition.xml...');

const categories = [
    { name: 'tools', tier: 1, price: 500 },
    { name: 'containers', tier: 1, price: 200 },
    { name: 'clothes', tier: 1, price: 150 },
    { name: 'lootdispatch', tier: 2, price: 300 },
    { name: 'food', tier: 1, price: 50 },
    { name: 'weapons', tier: 3, price: 2000 },
    { name: 'books', tier: 1, price: 25 },
    { name: 'explosives', tier: 4, price: 5000 }
];

categories.forEach((cat, index) => {
    db.run(
        'INSERT INTO categories (id, name, tier, price) VALUES (?, ?, ?, ?)',
        [index + 1, cat.name, cat.tier, cat.price],
        function (err) {
            if (err) {
                console.error(`❌ Erro ao inserir categoria ${cat.name}:`, err.message);
            } else {
                console.log(`✅ Categoria: ${cat.name} (Tier ${cat.tier})`);
            }
        }
    );
});

// Tags do DayZ
console.log('\n🏷️ Inserindo tags...');
const tags = ['floor', 'shelves', 'ground'];

tags.forEach((tag, index) => {
    db.run(
        'INSERT INTO tags (id, name) VALUES (?, ?)',
        [index + 1, tag],
        function (err) {
            if (err) {
                console.error(`❌ Erro ao inserir tag ${tag}:`, err.message);
            } else {
                console.log(`✅ Tag: ${tag}`);
            }
        }
    );
});

// Usage types do DayZ
console.log('\n🎯 Inserindo tipos de uso...');
const usageTypes = [
    'Military', 'Police', 'Medic', 'Firefighter', 'Industrial', 'Farm',
    'Coast', 'Town', 'Village', 'Hunting', 'Office', 'School',
    'Prison', 'Lunapark', 'SeasonalEvent', 'ContaminatedArea', 'Historical'
];

usageTypes.forEach((usage, index) => {
    db.run(
        'INSERT INTO usage_types (id, name) VALUES (?, ?)',
        [index + 1, usage],
        function (err) {
            if (err) {
                console.error(`❌ Erro ao inserir usage ${usage}:`, err.message);
            } else {
                console.log(`✅ Usage: ${usage}`);
            }
        }
    );
});

// Itens exemplo para cada categoria
console.log('\n🎮 Inserindo itens exemplo...');

const exampleItems = [
    {
        classname: 'Hammer',
        category_id: 1, // tools
        nominal: 15,
        min: 8,
        quantmin: 50, // 50%
        quantmax: 90, // 90%
        tier: '1,2', // Múltiplos tiers
        price: 350,
        lifetime: 14400, // 4 horas
        restock: 1800,
        flag_events: 1,
        flag_market: 1,
        flag_p2p: 1,
        flag_secure: 1,
        flag_store: 1,
        flag_dispatch: 0
    },
    {
        classname: 'ProtectorCase',
        category_id: 2, // containers
        nominal: 5,
        min: 2,
        quantmin: 25,
        quantmax: 75,
        tier: '2,3',
        price: 1200,
        lifetime: 259200, // 3 dias
        restock: 3600,
        flag_events: 1,
        flag_market: 1,
        flag_p2p: 1,
        flag_secure: 1,
        flag_store: 1,
        flag_dispatch: 0
    },
    {
        classname: 'TacticalShirt_Black',
        category_id: 3, // clothes
        nominal: 20,
        min: 10,
        quantmin: 60,
        quantmax: 95,
        tier: '1',
        price: 180,
        lifetime: 28800, // 8 horas
        restock: 1200,
        flag_events: 1,
        flag_market: 1,
        flag_p2p: 1,
        flag_secure: 1,
        flag_store: 1,
        flag_dispatch: 0
    },
    {
        classname: 'Apple',
        category_id: 5, // food
        nominal: 50,
        min: 25,
        quantmin: 80,
        quantmax: 100,
        tier: '1',
        price: 15,
        lifetime: 1800, // 30 min
        restock: 600,
        flag_events: 1,
        flag_market: 0,
        flag_p2p: 1,
        flag_secure: 0,
        flag_store: 1,
        flag_dispatch: 0
    },
    {
        classname: 'AKM',
        category_id: 6, // weapons
        nominal: 3,
        min: 1,
        quantmin: 10,
        quantmax: 40,
        tier: '3,4',
        price: 8500,
        lifetime: 604800, // 1 semana
        restock: 7200,
        flag_events: 1,
        flag_market: 1,
        flag_p2p: 1,
        flag_secure: 1,
        flag_store: 1,
        flag_dispatch: 1
    },
    {
        classname: 'Grenade_RGD5',
        category_id: 8, // explosives
        nominal: 2,
        min: 1,
        quantmin: 5,
        quantmax: 25,
        tier: '4',
        price: 12000,
        lifetime: -1, // Infinito
        restock: 10800,
        flag_events: 1,
        flag_market: 0,
        flag_p2p: 1,
        flag_secure: 1,
        flag_store: 0,
        flag_dispatch: 1
    }
];

exampleItems.forEach((item) => {
    db.run(
        `INSERT INTO items (
      classname, category_id, nominal, min, quantmin, quantmax, 
      tier, price, lifetime, restock,
      flag_events, flag_market, flag_p2p, flag_secure, flag_store, flag_dispatch
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            item.classname, item.category_id, item.nominal, item.min,
            item.quantmin, item.quantmax, item.tier, item.price,
            item.lifetime, item.restock,
            item.flag_events, item.flag_market, item.flag_p2p,
            item.flag_secure, item.flag_store, item.flag_dispatch
        ],
        function (err) {
            if (err) {
                console.error(`❌ Erro ao inserir ${item.classname}:`, err.message);
            } else {
                console.log(`✅ Item: ${item.classname} (${item.tier})`);
            }
        }
    );
});

setTimeout(() => {
    console.log('\n🎉 Database atualizado com sucesso!');
    console.log('🎮 Categorias do DayZ configuradas');
    console.log('📊 Itens exemplo adicionados');
    console.log('🔄 Reinicie o servidor para ver as mudanças');
    db.close();
}, 2000);