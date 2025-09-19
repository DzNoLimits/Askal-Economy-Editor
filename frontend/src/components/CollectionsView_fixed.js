import React, { useState, useEffect, useRef } from 'react';
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
        fetchCollections();
    }, []);

    // Handlers para redimensionamento
    const handleMouseDown = () => {
        setIsResizing(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = (e) => {
        if (!isResizing || !containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const newLeftWidth = e.clientX - containerRect.left;
        
        if (newLeftWidth >= 250 && newLeftWidth <= containerWidth - 300) {
            setLeftWidth(newLeftWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
    };

    // Cleanup
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            console.log('🔍 Testing API connection...');

            // Testar conexão básica
            const response = await fetch('http://localhost:3003/api/collections');
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Raw response data:', data);
            console.log('📊 Data type:', typeof data);
            console.log('📊 Is array:', Array.isArray(data));
            console.log('📊 Data length:', data?.length);
            
            if (Array.isArray(data)) {
                setCollections(data);
                console.log('✅ Collections state updated with', data.length, 'items');
            } else {
                console.error('❌ Data is not an array:', data);
                setCollections([]);
            }
        } catch (error) {
            console.error('❌ Error fetching collections:', error);
            setCollections([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async (collectionId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3003/api/collections/${collectionId}/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (categoryId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3003/api/categories/${categoryId}/items?expand=variants`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionSelect = (collection) => {
        setSelectedCollection(collection);
        setSelectedCategory(null);
        setCategories([]);
        setItems([]);
        fetchCategories(collection.id);
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

    const handleCreateCollection = () => {
        const name = prompt('Nome da nova coleção:');
        if (name && name.trim()) {
            const newCollection = {
                id: Date.now(), // ID temporário
                name: name.toLowerCase().replace(/\s+/g, '_'),
                display_name: name,
                description: '',
                icon: '📁',
                color: '#4a90e2',
                category_count: 0,
                item_count: 0
            };
            
            // Adicionar à lista local (em produção seria uma chamada à API)
            setCollections(prev => [...prev, newCollection]);
            console.log('✅ Nova coleção criada:', newCollection);
        }
    };

    const handleCreateCategory = () => {
        if (!selectedCollection) return;
        
        const name = prompt('Nome da nova categoria:');
        if (name && name.trim()) {
            const newCategory = {
                id: Date.now(), // ID temporário
                name: name.toLowerCase().replace(/\s+/g, '_'),
                display_name: name,
                description: `Categoria ${name}`,
                collection_id: selectedCollection.id,
                item_count: 0
            };
            
            // Adicionar à lista local (em produção seria uma chamada à API)
            setCategories(prev => [...prev, newCategory]);
            
            // Atualizar o contador da collection
            setCollections(prev => prev.map(col => 
                col.id === selectedCollection.id 
                    ? { ...col, category_count: col.category_count + 1 }
                    : col
            ));
            
            console.log('✅ Nova categoria criada:', newCategory);
        }
    };

    const handleCreateItem = () => {
        if (!selectedCategory) return;
        
        const classname = prompt('Classname do novo item (ex: AKM, M4A1, etc):');
        if (classname && classname.trim()) {
            const newItem = {
                id: Date.now(), // ID temporário
                classname: classname.trim(),
                category_id: selectedCategory.id,
                tier: [1], // Array de tiers
                nominal: 10,
                min: 5,
                lifetime: 14400, // 4 horas
                restock: 3600, // 1 hora
                quantmin: 50,
                quantmax: 80,
                price: 100, // Movido para basic parameters
                flags: {
                    Dispatch: false,
                    Events: true,
                    Market: true,
                    P2P: true,
                    Secure: true,
                    Store: true
                },
                tags: [],
                usage: [selectedCategory.display_name?.toLowerCase() || 'tools'], // Usar categoria como usage inicial
                variants: []
            };
            
            // Adicionar à lista local (em produção seria uma chamada à API)
            setItems(prev => [...prev, newItem]);
            
            // Atualizar contadores
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
            
            console.log('✅ Novo item criado:', newItem);
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
                        ➕ Nova Collection
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
                            <span>� Nenhuma coleção</span>
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
                                                {items.length > 0 ? (
                                                    <div className="items-list-compact">
                                                        {items.map(item => (
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
                                                )}
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