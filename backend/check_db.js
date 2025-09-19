const db = require('./database');

console.log('🔍 Verificando estrutura do database...');

// Verificar se as tabelas existem
const checkTables = () => {
    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
        if (err) {
            console.error('❌ Erro ao verificar tabelas:', err);
            return;
        }
        
        console.log('📋 Tabelas encontradas:');
        tables.forEach(table => {
            console.log(`  - ${table.name}`);
        });
        
        // Verificar dados nas collections
        db.all('SELECT * FROM collections', [], (err, collections) => {
            if (err) {
                console.error('❌ Erro ao buscar collections:', err);
                return;
            }
            
            console.log(`\n📁 Collections (${collections.length}):`);
            collections.forEach(col => {
                console.log(`  - ${col.name}: ${col.display_name} (${col.icon})`);
            });
            
            // Verificar categorias
            db.all('SELECT * FROM categories LIMIT 10', [], (err, categories) => {
                if (err) {
                    console.error('❌ Erro ao buscar categories:', err);
                    return;
                }
                
                console.log(`\n📂 Categories (mostrando 10 de ${categories.length || 0}):`);
                categories.forEach(cat => {
                    console.log(`  - ${cat.name}: ${cat.display_name}`);
                });
                
                process.exit(0);
            });
        });
    });
};

checkTables();