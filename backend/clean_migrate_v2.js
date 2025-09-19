const db = require('./database');
const { initDatabaseV2 } = require('./initDatabase_v2');

console.log('🔄 Starting Clean Migration to Database v2.0');
console.log('⚠️  This will remove old tables and create new structure');

// Função para remover tabelas antigas
const dropOldTables = () => {
  return new Promise((resolve, reject) => {
    console.log('🗑️ Removing old table structure...');
    
    const dropQueries = [
      'DROP TABLE IF EXISTS variants',
      'DROP TABLE IF EXISTS items', 
      'DROP TABLE IF EXISTS categories'
    ];
    
    let completed = 0;
    
    dropQueries.forEach(query => {
      db.run(query, [], (err) => {
        if (err) {
          console.error(`❌ Error dropping table: ${err.message}`);
          reject(err);
          return;
        }
        
        completed++;
        console.log(`✅ Dropped table (${completed}/${dropQueries.length})`);
        
        if (completed === dropQueries.length) {
          console.log('✅ All old tables removed successfully');
          resolve();
        }
      });
    });
  });
};

// Executar migração limpa
const runCleanMigration = async () => {
  try {
    // Remover tabelas antigas
    await dropOldTables();
    
    // Aguardar um pouco antes de recriar
    setTimeout(() => {
      console.log('🏗️ Creating new database structure...');
      initDatabaseV2();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

runCleanMigration();

console.log('\n📊 New Structure:');
console.log('📁 Collections (8 collections like Weapons, Tools, etc.)');
console.log('├── 📂 Categories (30+ categories like Assault Rifles, DMR, etc.)');
console.log('    ├── 📄 Items (M4A1, AKM, Winchester_Model70, etc.)');
console.log('        └── 🎨 Variants (M4A1_Black, M4A1_Green, etc.)');