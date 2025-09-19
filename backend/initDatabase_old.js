const db = require('./database');

// Cria as tabelas
const createTables = () => {
  // Tabela de collections (substitui categories para ser mais preciso)
  db.run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de category_defaults (valores padrão por collection)
  db.run(`CREATE TABLE IF NOT EXISTS category_defaults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    category_name TEXT NOT NULL,
    restock INTEGER DEFAULT 1800,
    cost INTEGER DEFAULT 1000,
    lifetime INTEGER DEFAULT 14400,
    tier INTEGER DEFAULT 1,
    min INTEGER DEFAULT 0,
    nominal INTEGER DEFAULT 10,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    flags TEXT DEFAULT '{}',
    FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE,
    UNIQUE(collection_id, category_name)
  )`);

  // Tabela de categorias
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    collection_id INTEGER NOT NULL,
    restock INTEGER DEFAULT 0,
    price INTEGER DEFAULT 100,
    tier INTEGER DEFAULT 1,
    lifetime INTEGER DEFAULT 3888000,
    min INTEGER DEFAULT 0,
    nominal INTEGER DEFAULT 10,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    flags TEXT DEFAULT '{}',
    FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE
  )`);

  // Tabela de itens (item base)
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classname TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    collection_id INTEGER NOT NULL,
    tier INTEGER DEFAULT 1,
    cost INTEGER DEFAULT 100,
    value INTEGER DEFAULT 100,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE
  )`);

  // Tabela de variantes (herdam do item base)
  db.run(`CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    variant_name TEXT NOT NULL,
    classname TEXT NOT NULL UNIQUE,
    
    -- Campos opcionais que sobrescrevem o item base (NULL = herda do pai)
    tier INTEGER NULL,
    cost INTEGER NULL,
    value INTEGER NULL,
    lifetime INTEGER NULL,
    restock INTEGER NULL,
    min INTEGER NULL,
    nominal INTEGER NULL,
    quantmin INTEGER NULL,
    quantmax INTEGER NULL,
    
    -- JSON fields que podem sobrescrever ou mesclar com o pai
    flags TEXT NULL,
    tags TEXT NULL,
    usage TEXT NULL,
    ammo_types TEXT NULL,
    magazines TEXT NULL,
    attachments TEXT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    UNIQUE(item_id, variant_name),
    UNIQUE(classname)
  )`);
};

// Seed data
const seedData = () => {
  // Inserir collections primeiro
  const collections = [
    { name: 'weapons', display_name: 'Weapons' },
    { name: 'items', display_name: 'Items' },
    { name: 'vehicles', display_name: 'Vehicles' }
  ];

  collections.forEach(collection => {
    db.run(`INSERT OR IGNORE INTO collections (name, display_name) VALUES (?, ?)`, 
      [collection.name, collection.display_name]);
  });

  // Inserir category defaults baseado no JSON do exemplo
  setTimeout(() => {
    const categoryDefaults = [
      { collection: 'weapons', category: "AR's", restock: 1800, cost: 4200 },
      { collection: 'weapons', category: "DMR's", restock: 1800, cost: 5200 },
      { collection: 'weapons', category: 'Pistols', restock: 1800, cost: 1800 },
      { collection: 'weapons', category: "SMG's", restock: 1800, cost: 3800 },
      { collection: 'weapons', category: "SR's", restock: 1800, cost: 3200 },
      { collection: 'weapons', category: 'Shotguns', restock: 1800, cost: 4000 }
    ];

    categoryDefaults.forEach(def => {
      db.run(`INSERT OR IGNORE INTO category_defaults 
        (collection_id, category_name, restock, cost) 
        VALUES (
          (SELECT id FROM collections WHERE name = ?), 
          ?, ?, ?
        )`, 
        [def.collection, def.category, def.restock, def.cost]);
    });

    // Inserir categorias padrão
    const categories = [
      { name: "AR's", collection: 'weapons', restock: 1800, price: 4200, tier: 3, lifetime: 14400 },
      { name: "DMR's", collection: 'weapons', restock: 1800, price: 5200, tier: 4, lifetime: 14400 },
      { name: 'Pistols', collection: 'weapons', restock: 1800, price: 1800, tier: 2, lifetime: 14400 },
      { name: "SMG's", collection: 'weapons', restock: 1800, price: 3800, tier: 3, lifetime: 14400 },
      { name: "SR's", collection: 'weapons', restock: 1800, price: 3200, tier: 3, lifetime: 14400 },
      { name: 'Shotguns', collection: 'weapons', restock: 1800, price: 4000, tier: 3, lifetime: 14400 },
      { name: 'tools', collection: 'items', restock: 1800, price: 500, tier: 2, lifetime: 7200 },
      { name: 'containers', collection: 'items', restock: 3600, price: 200, tier: 1, lifetime: 14400 }
    ];

    categories.forEach(cat => {
      db.run(`INSERT OR IGNORE INTO categories 
        (name, collection_id, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags) 
        VALUES (?, (SELECT id FROM collections WHERE name = ?), ?, ?, ?, ?, 0, 10, -1, -1, '{}')`, 
        [cat.name, cat.collection, cat.restock, cat.price, cat.tier, cat.lifetime]);
    });
  }, 100);
  });

  // Inserir itens de exemplo
  setTimeout(() => {
    // M4A1
    db.run(`INSERT OR IGNORE INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, quantmin, quantmax, flags, tags, usage, ammo_types, magazines, attachments) 
            VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'M4A1',
        4,
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
        JSON.stringify(['M4_CarryHandleOptic', 'M4_T3NRDSOptic', 'ACOGOptic'])
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
        3,
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
        JSON.stringify(['AK_WoodBttstck', 'AK_FoldingBttstck'])
      ]
    );

    // Shovel
    db.run(`INSERT OR IGNORE INTO items (classname, category_id, tier, price, lifetime, restock, min, nominal, quantmin, quantmax, flags, tags, usage) 
            VALUES (?, 2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Shovel',
        2,
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
        1,
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
  }, 1000);
};

// Executar
createTables();
setTimeout(seedData, 500);

console.log('Database initialized with seed data!');
