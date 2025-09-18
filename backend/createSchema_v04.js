const db = require('./database');

// Cria as tabelas para suporte completo ao formato JSON v0.4
const createTables = () => {
  console.log('Creating database schema v0.4...');

  // Tabela de categorias expandida
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    
    -- Flags como colunas separadas para melhor performance
    flag_events BOOLEAN DEFAULT 1,
    flag_market BOOLEAN DEFAULT 1,
    flag_p2p BOOLEAN DEFAULT 1,
    flag_secure BOOLEAN DEFAULT 1,
    flag_store BOOLEAN DEFAULT 1,
    flag_dispatch BOOLEAN DEFAULT 0,
    
    -- Propriedades da categoria
    price INTEGER DEFAULT 100,
    priority INTEGER DEFAULT 100,
    lifetime INTEGER DEFAULT 86400,
    restock INTEGER DEFAULT 600,
    min INTEGER DEFAULT 1,
    nominal INTEGER DEFAULT 1,
    quantmin INTEGER DEFAULT -1,
    quantmax INTEGER DEFAULT -1,
    tier INTEGER DEFAULT 1,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de itens expandida
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classname TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    
    -- Propriedades do item (podem sobrescrever categoria)
    nominal INTEGER,
    min INTEGER,
    quantmin INTEGER,
    quantmax INTEGER,
    tier INTEGER,
    price INTEGER,
    lifetime INTEGER,
    restock INTEGER,
    
    -- Flags específicas do item (podem sobrescrever categoria)
    flag_events BOOLEAN,
    flag_market BOOLEAN,
    flag_p2p BOOLEAN,
    flag_secure BOOLEAN,
    flag_store BOOLEAN,
    flag_dispatch BOOLEAN,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  )`);

  // Tabela de variantes
  db.run(`CREATE TABLE IF NOT EXISTS variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    
    -- Propriedades que podem sobrescrever o item base
    nominal INTEGER,
    min INTEGER,
    quantmin INTEGER,
    quantmax INTEGER,
    tier INTEGER,
    price INTEGER,
    lifetime INTEGER,
    restock INTEGER,
    
    -- Flags específicas da variante
    flag_events BOOLEAN,
    flag_market BOOLEAN,
    flag_p2p BOOLEAN,
    flag_secure BOOLEAN,
    flag_store BOOLEAN,
    flag_dispatch BOOLEAN,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    UNIQUE(item_id, name)
  )`);

  // Tabela de tags
  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Tabela de usage
  db.run(`CREATE TABLE IF NOT EXISTS usage_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Tabela de tipos de munição
  db.run(`CREATE TABLE IF NOT EXISTS ammo_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Tabela de magazines
  db.run(`CREATE TABLE IF NOT EXISTS magazines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Tabela de tipos de attachments
  db.run(`CREATE TABLE IF NOT EXISTS attachment_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE -- ex: optics, suppressors, bayonets, buttstocks
  )`);

  // Tabela de attachments
  db.run(`CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type_id INTEGER NOT NULL,
    FOREIGN KEY (type_id) REFERENCES attachment_types (id) ON DELETE CASCADE
  )`);

  // === TABELAS DE RELACIONAMENTO ===

  // Item <-> Tags (many-to-many)
  db.run(`CREATE TABLE IF NOT EXISTS item_tags (
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
  )`);

  // Item <-> Usage (many-to-many)
  db.run(`CREATE TABLE IF NOT EXISTS item_usage (
    item_id INTEGER NOT NULL,
    usage_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, usage_id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    FOREIGN KEY (usage_id) REFERENCES usage_types (id) ON DELETE CASCADE
  )`);

  // Item <-> Ammo Types (many-to-many)
  db.run(`CREATE TABLE IF NOT EXISTS item_ammo_types (
    item_id INTEGER NOT NULL,
    ammo_type_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, ammo_type_id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    FOREIGN KEY (ammo_type_id) REFERENCES ammo_types (id) ON DELETE CASCADE
  )`);

  // Item <-> Magazines (many-to-many)
  db.run(`CREATE TABLE IF NOT EXISTS item_magazines (
    item_id INTEGER NOT NULL,
    magazine_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, magazine_id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    FOREIGN KEY (magazine_id) REFERENCES magazines (id) ON DELETE CASCADE
  )`);

  // Item <-> Attachments (many-to-many)
  db.run(`CREATE TABLE IF NOT EXISTS item_attachments (
    item_id INTEGER NOT NULL,
    attachment_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, attachment_id),
    FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
    FOREIGN KEY (attachment_id) REFERENCES attachments (id) ON DELETE CASCADE
  )`);

  console.log('Database schema v0.4 created successfully!');
};

// Executar
createTables();

module.exports = { createTables };