const db = require('./database');

// Cria as tabelas
const createTables = () => {
  console.log('🔧 Criando tabelas...');
  
  // Tabela de collections (NOVA)
  db.run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT '#4a90e2',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de categorias (ATUALIZADA)
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    description TEXT DEFAULT '',
    collection_id INTEGER,
    item_count INTEGER DEFAULT 0,
    restock INTEGER DEFAULT 0,
    price INTEGER DEFAULT 100,
    tier INTEGER DEFAULT 1,
    lifetime INTEGER DEFAULT 3888000,
    min INTEGER DEFAULT 0,
    nominal INTEGER DEFAULT 10,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    flags TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE SET NULL
  )`);

  // Tabela de itens (ATUALIZADA)
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classname TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    tier TEXT DEFAULT '[1]',
    price INTEGER DEFAULT 100,
    lifetime INTEGER DEFAULT 3888000,
    restock INTEGER DEFAULT 0,
    min INTEGER DEFAULT 0,
    nominal INTEGER DEFAULT 10,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    flags TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    usage TEXT DEFAULT '[]',
    ammo_types TEXT DEFAULT '[]',
    magazines TEXT DEFAULT '[]',
    attachments TEXT DEFAULT '{}',
    variants TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  )`);

  // Tabela de variantes (ATUALIZADA)
  db.run(`CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    tier INTEGER,
    price INTEGER,
    lifetime INTEGER,
    restock INTEGER,
    min INTEGER,
    nominal INTEGER,
    quantmin INTEGER,
    quantmax INTEGER,
    flags TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    usage TEXT DEFAULT '[]',
    ammo_types TEXT DEFAULT '[]',
    magazines TEXT DEFAULT '[]',
    attachments TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
  )`);

  console.log('✅ Tabelas criadas com sucesso!');
};

// Seed data
const seedData = () => {
  console.log('🌱 Inserindo dados iniciais...');
  
  // Inserir collections padrão
  const collections = [
    {
      name: 'weapons',
      display_name: 'Weapons',
      description: 'Armas e equipamentos militares',
      icon: '🔫',
      color: '#ef4444'
    },
    {
      name: 'tools',
      display_name: 'Tools',
      description: 'Ferramentas e equipamentos',
      icon: '🔧',
      color: '#f97316'
    },
    {
      name: 'containers',
      display_name: 'Containers',
      description: 'Containers e armazenamento',
      icon: '📦',
      color: '#3b82f6'
    }
  ];

  collections.forEach(col => {
    db.run(`INSERT OR IGNORE INTO collections (name, display_name, description, icon, color) 
            VALUES (?, ?, ?, ?, ?)`,
      [col.name, col.display_name, col.description, col.icon, col.color]
    );
  });

  // Inserir categorias padrão
  const categories = [
    {
      name: 'assault_rifles',
      display_name: 'Assault Rifles',
      description: 'Rifles de assalto',
      collection_id: 1,
      restock: 0,
      price: 1000,
      tier: 3,
      lifetime: 3888000,
      min: 1,
      nominal: 5,
      quantmin: -1,
      quantmax: -1,
      flags: JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 })
    },
    {
      name: 'tools_basic',
      display_name: 'Basic Tools',
      description: 'Ferramentas básicas',
      collection_id: 2,
      restock: 1800,
      price: 500,
      tier: 2,
      lifetime: 7200,
      min: 2,
      nominal: 10,
      quantmin: -1,
      quantmax: -1,
      flags: JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 })
    },
    {
      name: 'storage_containers',
      display_name: 'Storage Containers',
      description: 'Containers de armazenamento',
      collection_id: 3,
      restock: 3600,
      price: 200,
      tier: 1,
      lifetime: 14400,
      min: 5,
      nominal: 20,
      quantmin: -1,
      quantmax: -1,
      flags: JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 })
    }
  ];

  categories.forEach(cat => {
    db.run(`INSERT OR IGNORE INTO categories (name, display_name, description, collection_id, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cat.name, cat.display_name, cat.description, cat.collection_id, cat.restock, cat.price, cat.tier, cat.lifetime, cat.min, cat.nominal, cat.quantmin, cat.quantmax, cat.flags]
    );
  });

  // Inserir itens de exemplo
  setTimeout(() => {
    console.log('📦 Inserindo itens de exemplo...');
    
    // M4A1
    db.run(`INSERT OR IGNORE INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments) 
            VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'M4A1',
        JSON.stringify([4]),
        2000,
        3888000,
        0,
        1,
        3,
        -1,
        -1,
        JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 }),
        JSON.stringify(['Military']),
        JSON.stringify(['Military']),
        JSON.stringify(['Ammo556x45', 'Ammo556x45Tracer']),
        JSON.stringify(['Mag_STANAG_30Rnd', 'Mag_STANAGCoupled_30Rnd', 'Mag_STANAG_60Rnd']),
        JSON.stringify({ optics: ['M4_CarryHandleOptic', 'M4_T3NRDSOptic', 'ACOGOptic'] })
      ],
      function(err) {
        if (!err && this.lastID) {
          // Adicionar variantes do M4A1
          const m4Id = this.lastID;
          const variants = [
            { name: 'M4A1_Green', tier: 4, price: 2200 },
            { name: 'M4A1_Black', tier: 4, price: 2100 },
            { name: 'M4A1_Tan', tier: 5, price: 2500 }
          ];

          variants.forEach(variant => {
            db.run(`INSERT OR IGNORE INTO variants (item_id, name, tier, price) VALUES (?, ?, ?, ?)`,
              [m4Id, variant.name, variant.tier, variant.price]
            );
          });
        }
      }
    );

    // AKM
    db.run(`INSERT OR IGNORE INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments) 
            VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'AKM',
        JSON.stringify([3]),
        1500,
        3888000,
        0,
        2,
        5,
        -1,
        -1,
        JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 }),
        JSON.stringify(['Military']),
        JSON.stringify(['Military', 'Police']),
        JSON.stringify(['Ammo762x39', 'Ammo762x39Tracer']),
        JSON.stringify(['Mag_AKM_30Rnd', 'Mag_AKM_Drum75Rnd']),
        JSON.stringify({ buttstocks: ['AK_WoodBttstck', 'AK_FoldingBttstck'] })
      ]
    );

    // Shovel
    db.run(`INSERT OR IGNORE INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, quantmin, quantmax, flags, tags, usage) 
            VALUES (?, 2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Shovel',
        JSON.stringify([2]),
        300,
        7200,
        1800,
        5,
        15,
        -1,
        -1,
        JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 }),
        JSON.stringify(['Industrial', 'Farm']),
        JSON.stringify(['Industrial', 'Farm', 'Village'])
      ]
    );

    // Barrel
    db.run(`INSERT OR IGNORE INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, quantmin, quantmax, flags, tags, usage) 
            VALUES (?, 3, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Barrel_Blue',
        JSON.stringify([1]),
        150,
        14400,
        3600,
        10,
        30,
        -1,
        -1,
        JSON.stringify({ count_in_cargo: 0, count_in_hoarder: 0, count_in_map: 1, count_in_player: 0, crafted: 0, deloot: 0 }),
        JSON.stringify(['Industrial']),
        JSON.stringify(['Industrial'])
      ]
    );
    
    console.log('✅ Dados iniciais inseridos com sucesso!');
  }, 1000);
};

// Executar
console.log('🚀 Inicializando banco de dados...');
createTables();
setTimeout(seedData, 500);

console.log('✅ Database initialized with seed data!');
