const { initDatabaseV2 } = require('./initDatabase_v2');

console.log('🔄 Starting Database Migration to v2.0');
console.log('📊 Structure: Collections -> Categories -> Items -> Variants\n');

// Executar migração
initDatabaseV2();

console.log('\n✅ Migration script completed!');
console.log('🚀 You can now start the server with the new structure.');