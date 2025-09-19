const db = require('./database');

// Nova estrutura hierárquica: Collections -> Categories -> Items -> Variants
const createTablesV2 = () => {
  console.log('🏗️ Creating new database structure: Collections -> Categories -> Items -> Variants');

  // Nível 1: Collections (ex: Weapons, Tools, Clothing, etc.)
  db.run(`CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#4a90e2',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Nível 2: Categories (ex: Assault Rifles, Sniper Rifles, DMRs, etc.)
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE,
    UNIQUE(collection_id, name)
  )`);

  // Nível 3: Items (ex: M4A1, AKM, Winchester_Model70)
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    classname TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- DayZ Economy Properties
    tier INTEGER DEFAULT 1,
    price INTEGER DEFAULT 100,
    lifetime INTEGER DEFAULT 3888000,
    restock INTEGER DEFAULT 0,
    min INTEGER DEFAULT 0,
    nominal INTEGER DEFAULT 10,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    
    -- DayZ Item Configuration
    flags TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    usage TEXT DEFAULT '[]',
    value TEXT DEFAULT '[]',
    
    -- Equipment specific
    ammo_types TEXT DEFAULT '[]',
    magazines TEXT DEFAULT '[]',
    attachments TEXT DEFAULT '[]',
    
    -- Metadata
    image_url TEXT,
    wiki_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  )`);

  // Nível 4: Variants (ex: M4A1_Black, M4A1_Green, M4A1_OEM)
  db.run(`CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Override properties (null = inherit from parent item)
    tier INTEGER,
    price INTEGER,
    lifetime INTEGER,
    restock INTEGER,
    min INTEGER,
    nominal INTEGER,
    quantmin INTEGER,
    quantmax INTEGER,
    
    -- Variant specific configuration
    flags TEXT,
    tags TEXT,
    usage TEXT,
    value TEXT,
    
    -- Metadata
    image_url TEXT,
    color_variant TEXT,
    rarity TEXT DEFAULT 'common', -- common, uncommon, rare, epic, legendary
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    UNIQUE(item_id, name)
  )`);

  console.log('✅ New database structure created successfully!');
};

// Popular com dados iniciais das Collections
const seedCollections = () => {
  console.log('🌱 Seeding initial Collections data...');
  
  const collections = [
    {
      name: 'weapons',
      display_name: 'Weapons Collection',
      description: 'All weapon types including firearms, melee weapons and projectiles',
      icon: '🔫',
      color: '#e74c3c'
    },
    {
      name: 'tools', 
      display_name: 'Tools Collection',
      description: 'Utility tools for crafting, repair and survival',
      icon: '🔧',
      color: '#f39c12'
    },
    {
      name: 'clothing',
      display_name: 'Clothing Collection', 
      description: 'Protective gear, clothing and accessories',
      icon: '👕',
      color: '#9b59b6'
    },
    {
      name: 'consumables',
      display_name: 'Consumables Collection',
      description: 'Food, drinks, medical supplies and consumable items',
      icon: '🍖',
      color: '#27ae60'
    },
    {
      name: 'storage',
      display_name: 'Storage Collection',
      description: 'Containers, bags and storage solutions',
      icon: '🎒',
      color: '#3498db'
    },
    {
      name: 'loot',
      display_name: 'Loot Collection',
      description: 'General loot items and miscellaneous objects',
      icon: '📦',
      color: '#95a5a6'
    },
    {
      name: 'literature',
      display_name: 'Literature Collection',
      description: 'Books, maps, papers and readable materials',
      icon: '📚',
      color: '#8e44ad'
    },
    {
      name: 'explosives',
      display_name: 'Explosives Collection',
      description: 'Explosive devices, mines and demolition equipment',
      icon: '💥',
      color: '#e67e22'
    }
  ];

  collections.forEach(collection => {
    db.run(
      `INSERT OR IGNORE INTO collections (name, display_name, description, icon, color) 
       VALUES (?, ?, ?, ?, ?)`,
      [collection.name, collection.display_name, collection.description, collection.icon, collection.color],
      function(err) {
        if (err) {
          console.error(`❌ Error inserting collection ${collection.name}:`, err);
        } else {
          console.log(`✅ Collection '${collection.display_name}' added`);
        }
      }
    );
  });
};

// Popular com categorias iniciais
const seedCategories = () => {
  console.log('🌱 Seeding initial Categories data...');
  
  // Primeiro, buscar os IDs das collections
  db.all(`SELECT id, name FROM collections`, [], (err, collections) => {
    if (err) {
      console.error('❌ Error fetching collections:', err);
      return;
    }

    const collectionMap = {};
    collections.forEach(col => {
      collectionMap[col.name] = col.id;
    });

    const categories = [
      // Weapons Collection
      { collection: 'weapons', name: 'assault_rifles', display_name: 'Assault Rifles', description: 'Automatic rifles for medium range combat' },
      { collection: 'weapons', name: 'sniper_rifles', display_name: 'Sniper Rifles', description: 'High precision long-range rifles' },
      { collection: 'weapons', name: 'dmr', display_name: 'Designated Marksman Rifles', description: 'Semi-automatic precision rifles' },
      { collection: 'weapons', name: 'submachine_guns', display_name: 'Submachine Guns', description: 'Compact automatic weapons' },
      { collection: 'weapons', name: 'shotguns', display_name: 'Shotguns', description: 'Close range spread weapons' },
      { collection: 'weapons', name: 'pistols', display_name: 'Pistols', description: 'Sidearm weapons' },
      { collection: 'weapons', name: 'melee_weapons', display_name: 'Melee Weapons', description: 'Hand-to-hand combat weapons' },
      
      // Tools Collection  
      { collection: 'tools', name: 'cutting_tools', display_name: 'Cutting Tools', description: 'Knives, axes and cutting implements' },
      { collection: 'tools', name: 'construction_tools', display_name: 'Construction Tools', description: 'Building and crafting tools' },
      { collection: 'tools', name: 'survival_tools', display_name: 'Survival Tools', description: 'Essential survival equipment' },
      { collection: 'tools', name: 'repair_tools', display_name: 'Repair Tools', description: 'Equipment maintenance tools' },
      
      // Clothing Collection
      { collection: 'clothing', name: 'headgear', display_name: 'Headgear', description: 'Helmets, hats and head protection' },
      { collection: 'clothing', name: 'upper_body', display_name: 'Upper Body', description: 'Shirts, jackets and torso clothing' },
      { collection: 'clothing', name: 'lower_body', display_name: 'Lower Body', description: 'Pants, shorts and leg clothing' },
      { collection: 'clothing', name: 'footwear', display_name: 'Footwear', description: 'Boots, shoes and foot protection' },
      { collection: 'clothing', name: 'accessories', display_name: 'Accessories', description: 'Gloves, belts and accessories' },
      
      // Consumables Collection
      { collection: 'consumables', name: 'food', display_name: 'Food', description: 'Edible items for nutrition' },
      { collection: 'consumables', name: 'drinks', display_name: 'Drinks', description: 'Beverages and liquids' },
      { collection: 'consumables', name: 'medical', display_name: 'Medical Supplies', description: 'First aid and medical items' },
      { collection: 'consumables', name: 'drugs', display_name: 'Drugs & Chemicals', description: 'Pharmaceutical and chemical items' },
      
      // Storage Collection
      { collection: 'storage', name: 'backpacks', display_name: 'Backpacks', description: 'Portable storage containers' },
      { collection: 'storage', name: 'containers', display_name: 'Containers', description: 'Fixed storage solutions' },
      { collection: 'storage', name: 'cases', display_name: 'Cases', description: 'Protective storage cases' },
      
      // Loot Collection
      { collection: 'loot', name: 'general_loot', display_name: 'General Loot', description: 'Miscellaneous loot items' },
      { collection: 'loot', name: 'vehicle_parts', display_name: 'Vehicle Parts', description: 'Car and vehicle components' },
      { collection: 'loot', name: 'electronics', display_name: 'Electronics', description: 'Electronic devices and components' },
      
      // Literature Collection
      { collection: 'literature', name: 'books', display_name: 'Books', description: 'Reading materials and guides' },
      { collection: 'literature', name: 'maps', display_name: 'Maps', description: 'Navigation and area maps' },
      { collection: 'literature', name: 'papers', display_name: 'Papers', description: 'Documents and written materials' },
      
      // Explosives Collection
      { collection: 'explosives', name: 'grenades', display_name: 'Grenades', description: 'Hand-thrown explosive devices' },
      { collection: 'explosives', name: 'mines', display_name: 'Mines', description: 'Planted explosive devices' },
      { collection: 'explosives', name: 'demolition', display_name: 'Demolition', description: 'Demolition charges and equipment' }
    ];

    categories.forEach((category, index) => {
      const collectionId = collectionMap[category.collection];
      if (collectionId) {
        db.run(
          `INSERT OR IGNORE INTO categories (collection_id, name, display_name, description, sort_order) 
           VALUES (?, ?, ?, ?, ?)`,
          [collectionId, category.name, category.display_name, category.description, index],
          function(err) {
            if (err) {
              console.error(`❌ Error inserting category ${category.name}:`, err);
            } else {
              console.log(`✅ Category '${category.display_name}' added to ${category.collection}`);
            }
          }
        );
      }
    });
  });
};

// Função para migrar dados antigos (opcional)
const migrateOldData = () => {
  console.log('🔄 Checking for old data migration...');
  
  // Verificar se existe a tabela antiga
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='categories'`, [], (err, row) => {
    if (err) {
      console.error('❌ Error checking old tables:', err);
      return;
    }
    
    if (row) {
      console.log('⚠️  Old table structure detected. Migration may be needed.');
      // Aqui podemos implementar migração automática se necessário
    } else {
      console.log('✅ Fresh database - no migration needed');
    }
  });
};

// Função principal de inicialização
const initDatabaseV2 = () => {
  console.log('🚀 Initializing DayZ Economy Editor Database v2.0');
  console.log('📊 New Structure: Collections -> Categories -> Items -> Variants');
  
  createTablesV2();
  
  // Aguardar criação das tabelas antes de popular
  setTimeout(() => {
    seedCollections();
    setTimeout(() => {
      seedCategories();
      migrateOldData();
    }, 1000);
  }, 500);
};

module.exports = {
  initDatabaseV2,
  createTablesV2,
  seedCollections,
  seedCategories,
  migrateOldData
};