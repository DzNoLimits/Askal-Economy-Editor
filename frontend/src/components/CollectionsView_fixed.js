import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CollectionsViewCompact.css';
import ItemDetailsV05 from './ItemDetailsV05_complete';

const CollectionsView = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para redimensionamento das colunas
    const [leftWidth, setLeftWidth] = useState(400); // Aumentado para categories+items
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    // Carregar Collections
    useEffect(() => {
        // Inicializar em modo local - não buscar do backend por enquanto
        console.log('🔍 Inicializando em modo local...');
        setCollections([]);
        setLoading(false);
    }, []);

    // Handlers para redimensionamento
    const handleMouseDown = () => {
        setIsResizing(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = useCallback((e) => {
        if (!isResizing || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const newLeftWidth = e.clientX - containerRect.left;

        if (newLeftWidth >= 250 && newLeftWidth <= containerWidth - 300) {
            setLeftWidth(newLeftWidth);
        }
    }, [isResizing, containerRef]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
    }, [handleMouseMove]);

    // Cleanup
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const fetchItems = async (categoryId) => {
        // Modo local - filtrar items por category_id  
        const localItems = items.filter(item => item.category_id === categoryId);
        console.log(`🔍 Items for category ${categoryId}:`, localItems);
        return localItems;
    };

    const handleCollectionSelect = (collection) => {
        setSelectedCollection(collection);
        setSelectedCategory(null);
        setSelectedItem(null);
        
        // Filtrar categorias desta collection
        const collectionCategories = categories.filter(cat => cat.collection_id === collection.id);
        console.log(`🔍 Selecionando collection: ${collection.display_name}, ${collectionCategories.length} categorias`);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSelectedItem(null); // Reset item selection when changing category
        setItems([]);
        fetchItems(category.id);
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const handleItemUpdate = (updatedItem) => {
        setItems(prev => prev.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        ));
        setSelectedItem(updatedItem);
    };

    // Carregar dados do backend
    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:3001/api/collections')
            .then(res => res.json())
            .then(data => {
                setCollections(data);
                setLoading(false);
            });
        fetch('http://localhost:3001/categories')
            .then(res => res.json())
            .then(data => setCategories(data));
        fetch('http://localhost:3001/items')
            .then(res => res.json())
            .then(data => setItems(data));
    }, []);

    // Criar coleção persistente
    const handleCreateCollection = async () => {
        const name = prompt('Nome da nova coleção:');
        if (name && name.trim()) {
            const newCollection = {
                name: name.toLowerCase().replace(/\s+/g, '_'),
                display_name: name,
                description: '',
                icon: '📁',
                color: '#4a90e2'
            };
            const res = await fetch('http://localhost:3001/api/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCollection)
            });
            const data = await res.json();
            setCollections(prev => [...prev, { ...newCollection, id: data.id, category_count: 0, item_count: 0 }]);
            console.log('✅ Nova coleção criada:', data);
        }
    };

    // Criar categoria persistente
    const handleCreateCategory = async () => {
        if (!selectedCollection) return;
        const name = prompt('Nome da nova categoria:');
        if (name && name.trim()) {
            const newCategory = {
                name: name.toLowerCase().replace(/\s+/g, '_'),
                display_name: name,
                description: `Categoria ${name}`,
                collection_id: selectedCollection.id,
                item_count: 0
            };
            const res = await fetch('http://localhost:3001/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });
            const data = await res.json();
            setCategories(prev => [...prev, { ...newCategory, id: data.id }]);
            setCollections(prev => prev.map(col =>
                col.id === selectedCollection.id
                    ? { ...col, category_count: col.category_count + 1 }
                    : col
            ));
            console.log('✅ Nova categoria criada:', data);
        }
    };

    // Criar item persistente
    const handleCreateItem = async () => {
        if (!selectedCategory) return;
        const classname = prompt('Classname do novo item (ex: AKM, M4A1, etc):');
        if (classname && classname.trim()) {
            const newItem = {
                classname: classname.trim(),
                category_id: selectedCategory.id,
                tier: [1],
                nominal: 10,
                min: 5,
                lifetime: 14400,
                restock: 3600,
                quantmin: 50,
                quantmax: 80,
                price: 100,
                flags: {
                    Dispatch: false,
                    Events: true,
                    Market: true,
                    P2P: true,
                    Secure: true,
                    Store: true
                },
                tags: [],
                usage: [selectedCategory.display_name?.toLowerCase() || 'tools'],
                variants: []
            };
            const res = await fetch('http://localhost:3001/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            const data = await res.json();
            setItems(prev => [...prev, { ...newItem, id: data.id }]);
            setCategories(prev => prev.map(cat =>
                cat.id === selectedCategory.id
                    ? { ...cat, item_count: cat.item_count + 1 }
                    : cat
            ));
            setCollections(prev => prev.map(col =>
                col.id === selectedCollection.id
                    ? { ...col, item_count: col.item_count + 1 }
                    : col
            ));
            console.log('✅ Novo item criado:', data);
        }
    };

    // Função para importar JSON do DayZ
    const handleImportJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const jsonData = JSON.parse(text);
                
                console.log('📋 JSON importado:', jsonData);
                
                // Processar a estrutura do JSON
                await processImportedJSON(jsonData);
                
            } catch (error) {
                console.error('❌ Erro ao importar JSON:', error);
                alert('Erro ao processar o arquivo JSON. Verifique o formato.');
            }
        };
        input.click();
    };

    const processImportedJSON = async (jsonData) => {
        try {
            setLoading(true);
            
            // Criar uma nova collection baseada no arquivo
            const collectionName = jsonData.database_version ? 
                `Weapons_v${jsonData.database_version}` : 
                'Imported_Weapons';
                
            const newCollection = {
                id: Date.now(),
                name: collectionName.toLowerCase(),
                display_name: collectionName,
                description: `Importado em ${new Date().toLocaleDateString()}`,
                icon: '🔫',
                color: '#ef4444',
                category_count: 0,
                item_count: 0
            };

            // Adicionar collection
            setCollections(prev => [...prev, newCollection]);
            
            // Processar categorias
            const categoriesFromJson = jsonData.Categories || {};
            const newCategories = [];
            const newItems = [];
            let totalItems = 0;

            for (const [categoryName, items] of Object.entries(categoriesFromJson)) {
                const categoryId = Date.now() + newCategories.length + Math.random() * 10000;
                console.log(`🔍 Criando categoria: ${categoryName} com ID: ${categoryId}`);
                
                const newCategory = {
                    id: categoryId,
                    name: categoryName.toLowerCase(),
                    display_name: categoryName,
                    description: `Categoria ${categoryName}`,
                    collection_id: newCollection.id,
                    item_count: Object.keys(items).length
                };
                
                newCategories.push(newCategory);
                
                // Processar items da categoria
                let itemIndex = 0;
                for (const [itemName, itemData] of Object.entries(items)) {
                    const itemId = Date.now() + totalItems + itemIndex + Math.random() * 10000;
                    console.log(`🔍 Criando item: ${itemName} para categoria ID: ${categoryId}`);
                    
                    const newItem = {
                        id: itemId,
                        classname: itemName,
                        category_id: categoryId,
                        
                        // Parâmetros básicos
                        nominal: itemData.nominal || 0,
                        min: itemData.min || 0,
                        tier: Array.isArray(itemData.tier) ? itemData.tier : [itemData.tier || 1],
                        lifetime: itemData.lifetime || 14400,
                        restock: itemData.restock || 1800,
                        quantmin: itemData.quantmin || -1,
                        quantmax: itemData.quantmax || -1,
                        price: itemData.cost || itemData.value || 100,
                        
                        // Flags
                        flags: {
                            Dispatch: itemData.flags?.Dispatch ?? false,
                            Events: itemData.flags?.Events ?? true,
                            Market: itemData.flags?.Market ?? true,
                            P2P: itemData.flags?.P2P ?? true,
                            Secure: itemData.flags?.Secure ?? true,
                            Store: itemData.flags?.Store ?? true
                        },
                        
                        // Arrays
                        tags: [], // Será herdado ou configurado manualmente
                        usage: [categoryName.toLowerCase()], // Usar categoria como usage
                        category: 'weapons', // Categoria geral
                        
                        // Attachments
                        attachments: itemData.attachments || {},
                        
                        // Variantes
                        variants: itemData.variants || {},
                        
                        // Dados extras do DayZ
                        ammo_types: itemData.ammo_types || [],
                        magazines: itemData.magazines || []
                    };
                    
                    totalItems++;
                    itemIndex++;
                    newItems.push(newItem);
                }
            }
            
            // Atualizar contadores da collection
            newCollection.category_count = newCategories.length;
            newCollection.item_count = totalItems;
            
            // Adicionar tudo de uma vez e forçar re-render
            const updatedCollections = [...collections, newCollection];
            const updatedCategories = [...categories, ...newCategories];
            const updatedItems = [...items, ...newItems];
            
            // Atualizar estados sequencialmente
            setCollections(updatedCollections);
            setCategories(updatedCategories);
            setItems(updatedItems);
            
            // Debug logs
            console.log('🔍 Categories criadas:', newCategories.map(c => ({id: c.id, name: c.display_name})));
            console.log('🔍 Items criados:', newItems.map(i => ({id: i.id, classname: i.classname, category_id: i.category_id})));
            console.log('🔍 Estados finais - Collections:', updatedCollections.length, 'Categories:', updatedCategories.length, 'Items:', updatedItems.length);
            
            // Aguardar um momento antes de selecionar a collection
            setTimeout(() => {
                setSelectedCollection(newCollection);
                console.log('🔍 Collection selecionada:', newCollection.display_name);
            }, 200);
            
            console.log(`✅ Importação concluída: ${newCategories.length} categorias, ${totalItems} items`);
            alert(`Importação concluída!\n${newCategories.length} categorias\n${totalItems} items`);
            
        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            alert('Erro ao processar os dados importados.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && collections.length === 0) {
        return <div className="loading">Loading Collections...</div>;
    }

    console.log('🎯 Rendering with collections.length:', collections.length);
    console.log('🎯 Collections array:', collections);

    return (
        <div className="collections-view">
            {/* Header minimalista */}
            <header className="collections-header-minimal">
                <div className="header-content">
                    <h1>🗂️ DayZ Economy Editor</h1>
                    <div className="debug-info">
                        Collections: {collections.length} | Categories: {categories.length} | Items: {items.length}
                    </div>
                </div>
            </header>

            {/* Collections bar horizontal */}
            <div className="collections-bar">
                <div className="collections-horizontal">
                    <button
                        className="create-collection-btn-horizontal"
                        onClick={handleCreateCollection}
                        title="Criar nova coleção"
                    >
                        ➕ Nova Coleção
                    </button>
                    <button
                        className="import-json-btn-horizontal"
                        onClick={handleImportJSON}
                        title="Importar JSON do DayZ"
                    >
                        📋 Importar JSON
                    </button>
                    {collections.length > 0 ? (
                        collections.map(collection => (
                            <div
                                key={collection.id}
                                className={`collection-tab ${selectedCollection?.id === collection.id ? 'selected' : ''}`}
                                onClick={() => handleCollectionSelect(collection)}
                                style={{ borderBottom: `3px solid ${collection.color}` }}
                            >
                                <div className="collection-tab-icon">{collection.icon}</div>
                                <div className="collection-tab-name">{collection.display_name}</div>
                                <div className="collection-tab-count">{collection.item_count}</div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-collections-horizontal">
                            <span>❗️ Nenhuma coleção</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout principal com 2 colunas */}
            <div
                className="main-layout"
                ref={containerRef}
                style={{
                    display: 'flex',
                    height: 'calc(100vh - 100px)', // Reduzido do header
                    position: 'relative'
                }}
            >
                {/* Categories Panel com Items */}
                {selectedCollection && (
                    <div
                        className="categories-panel-main"
                        style={{
                            width: `${leftWidth}px`,
                            minWidth: '250px',
                            maxWidth: '600px',
                            flexShrink: 0,
                            overflow: 'auto'
                        }}
                    >
                        <div className="categories-header-compact">
                            <h2>📂 {selectedCollection.display_name}</h2>
                            <button
                                className="create-category-btn-compact"
                                onClick={handleCreateCategory}
                                title="Criar nova categoria"
                            >
                                ➕
                            </button>
                        </div>
                        <div className="categories-grid-compact">
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <div key={category.id} className="category-container-compact">
                                        <div
                                            className={`category-card-compact ${selectedCategory?.id === category.id ? 'selected' : ''}`}
                                            onClick={() => handleCategorySelect(category)}
                                        >
                                            <div className="category-info-compact">
                                                <div className="category-name-compact">{category.display_name}</div>
                                                <div className="category-count-compact">{category.item_count} items</div>
                                            </div>
                                            {selectedCategory?.id === category.id && (
                                                <div className="category-selected-indicator">▼</div>
                                            )}
                                        </div>

                                        {/* Items dentro da categoria selecionada */}
                                        {selectedCategory?.id === category.id && (
                                            <div className="items-in-category-compact">
                                                <div className="items-header-compact">
                                                    <span>📄 Items</span>
                                                    <button
                                                        className="create-item-btn-compact"
                                                        onClick={handleCreateItem}
                                                        title="Criar novo item"
                                                    >
                                                        ➕
                                                    </button>
                                                </div>
                                                {(() => {
                                                    console.log('🔍 Estado items no momento do filtro:', items.length);
                                                    const categoryItems = items.filter(item => item.category_id === category.id);
                                                    console.log(`🔍 Filtro Debug - Category ID: ${category.id}, Items encontrados: ${categoryItems.length}`);
                                                    console.log(`🔍 Total items disponíveis: ${items.length}`);
                                                    console.log(`🔍 Categoria: ${category.display_name}`);
                                                    console.log(`🔍 Items com category_id:`, items.map(i => ({classname: i.classname, category_id: i.category_id})));
                                                    
                                                    return categoryItems.length > 0 ? (
                                                        <div className="items-list-compact">
                                                            {categoryItems.map(item => (
                                                                <div
                                                                    key={item.id}
                                                                    className={`item-card-compact ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                                                    onClick={() => handleItemSelect(item)}
                                                                >
                                                                    <div className="item-header-compact">
                                                                        <div className="item-name-compact">{item.classname}</div>
                                                                        <div className="item-tier-compact">
                                                                            T{Array.isArray(item.tier) ? item.tier.join(',') : item.tier}
                                                                        </div>
                                                                    </div>
                                                                    <div className="item-stats-compact">
                                                                        <span>N:{item.nominal}</span>
                                                                        <span>M:{item.min}</span>
                                                                        <span>${item.price || item.cost || 100}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="no-items-compact">
                                                            <p>📄 Nenhum item</p>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="empty-categories-compact">
                                    <p>📂 Nenhuma categoria</p>
                                    <p>Clique ➕ para criar</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Resizer */}
                <div
                    className="resizer-main"
                    onMouseDown={handleMouseDown}
                    style={{
                        width: '4px',
                        backgroundColor: isResizing ? '#007ACC' : 'transparent',
                        cursor: 'col-resize',
                        flexShrink: 0,
                        borderRight: '1px solid #333',
                        position: 'relative',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#007ACC'}
                    onMouseLeave={(e) => { if (!isResizing) e.target.style.backgroundColor = 'transparent'; }}
                />

                {/* Item Details Panel */}
                <div
                    className="item-details-panel-main"
                    style={{
                        flex: 1,
                        minWidth: '300px',
                        overflow: 'auto'
                    }}
                >
                    {selectedItem ? (
                        <ItemDetailsV05
                            item={selectedItem}
                            onUpdateItem={handleItemUpdate}
                            categories={categories || []}
                        />
                    ) : (
                        <div className="no-item-selected-compact">
                            <div className="no-selection-content-compact">
                                <h3>⚙️ Item Editor</h3>
                                <p>Selecione um item para editar</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionsView;