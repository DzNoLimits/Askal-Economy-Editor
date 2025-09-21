// Teste rápido da API v0.4
console.log('🔍 Testando API v0.4...');

fetch('http://localhost:3001/api/items/1?expand=true')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Dados expandidos da M4A1:', data);

        // Verificar se todos os dados estão presentes
        console.log('📦 Propriedades básicas:', {
            classname: data.classname,
            tier: data.tier,
            price: data.price,
            nominal: data.nominal
        });

        console.log('🏁 Flags:', data.flags);
        console.log('🏷️ Tags:', data.tags);
        console.log('🎯 Usage:', data.usage);
        console.log('🔫 Ammo Types:', data.ammo_types);
        console.log('📦 Magazines:', data.magazines);
        console.log('🔧 Attachments:', data.attachments);
        console.log('🎨 Variants:', data.variants);
    })
    .catch(error => {
        console.error('❌ Erro ao carregar dados:', error);
    });