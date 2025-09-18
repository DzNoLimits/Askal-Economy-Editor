const db = require('./database');

// Cria as tabelas
const createTables = () => {
  // Tabela de categorias
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    restock INTEGER DEFAULT 0,
    price INTEGER DEFAULT 100,
    tier INTEGER DEFAULT 1,
    lifetime INTEGER DEFAULT 3888000,
    min INTEGER DEFAULT 0,
    nominal INTEGER DEFAULT 10,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    flags TEXT DEFAULT '{}'
  )`);

  // Tabela de itens
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classname TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    tier INTEGER DEFAULT 1,
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
    attachments TEXT DEFAULT '[]',
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  )`);

  // Tabela de variantes
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
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
  )`);
};

// Seed data
const seedData = () => {
  // Inserir categorias padrão
  const categories = [
    {
      name: 'weapons',
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
      name: 'tools',
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
      name: 'containers',
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
    db.run(`INSERT OR IGNORE INTO categories (name, restock, price, tier, lifetime, min, nominal, quantmin, quantmax, flags) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cat.name, cat.restock, cat.price, cat.tier, cat.lifetime, cat.min, cat.nominal, cat.quantmin, cat.quantmax, cat.flags]
    );
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
