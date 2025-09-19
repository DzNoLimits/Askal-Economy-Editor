import React, { useState, useEffect } from 'react';
import './CollectionsView.css';

const CollectionsView = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [categoryItems, setCategoryItems] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);

    // Carregar Collections
    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            console.log('🚀 Tentando buscar collections...');
            const response = await fetch('http://localhost:3003/api/collections');
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📊 Collections data:', data);
            console.log('📊 Collections data type:', typeof data);
            console.log('📊 Collections array?:', Array.isArray(data));
            console.log('📊 Collections length:', data?.length);
            
            if (Array.isArray(data)) {
                setCollections(data);
                console.log('✅ Collections state updated!');
            } else {
                console.error('❌ Data is not an array:', data);
            }
        } catch (error) {
            console.error('❌ Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async (collectionId) => {
        try {
            setLoading(true);
            console.log('🔍 Fetching categories for collection:', collectionId);
            const response = await fetch(`http://localhost:3003/api/collections/${collectionId}/categories`);
            const data = await response.json();
            console.log('📂 Categories received:', data);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionSelect = (collection) => {
        setSelectedCollection(collection);
        setSelectedItem(null);
        setExpandedCategories(new Set());
        setCategoryItems({});
        setCategories([]);
        fetchCategories(collection.id);
    };

    const handleCategoryToggle = async (category) => {
        const newExpanded = new Set(expandedCategories);
        
        if (expandedCategories.has(category.id)) {
            // Collapse category
            newExpanded.delete(category.id);
        } else {
            // Expand category - fetch items if not already loaded
            newExpanded.add(category.id);
            if (!categoryItems[category.id]) {
                try {
                    setLoading(true);
                    const response = await fetch(`http://localhost:3003/api/categories/${category.id}/items?expand=variants`);
                    const items = await response.json();
                    setCategoryItems(prev => ({...prev, [category.id]: items}));
                } catch (error) {
                    console.error('Error fetching items:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        
        setExpandedCategories(newExpanded);
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    if (loading && collections.length === 0) {
        return <div className="loading">🔄 Loading Collections...</div>;
    }

    console.log('🎯 Rendering component with collections:', collections.length);
    console.log('🎯 Collections state:', collections);

    return (
        <div className="collections-view">
            <header className="collections-header">
                <h1>🗂️ DayZ Economy Editor v2.0</h1>
                <div style={{fontSize: '12px', color: '#888'}}>
                    Collections: {collections.length} | Loading: {loading ? 'Yes' : 'No'}
                </div>
            </header>

            <div className="collections-layout">
                {/* Collections Sidebar */}
                <div className="collections-sidebar">
                    <h2>📁 Collections</h2>
                    <div className="collections-list">
                        {collections.map(collection => (
                            <div
                                key={collection.id}
                                className={`collection-item ${selectedCollection?.id === collection.id ? 'selected' : ''}`}
                                onClick={() => handleCollectionSelect(collection)}
                                style={{ borderLeft: `4px solid ${collection.color}` }}
                            >
                                <div className="collection-icon">{collection.icon}</div>
                                <div className="collection-info">
                                    <div className="collection-name">{collection.display_name}</div>
                                    <div className="collection-stats">
                                        {collection.category_count} categories
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories & Items Panel */}
                <div className="categories-items-panel">
                    {selectedCollection ? (
                        <>
                            <div className="panel-header">
                                <h2>📂 {selectedCollection.display_name} Categories</h2>
                                <p style={{color: '#888', padding: '8px 16px', margin: 0}}>
                                    Categories loaded: {categories.length} | Loading: {loading ? 'Yes' : 'No'}
                                </p>
                            </div>
                            
                            <div className="categories-list">
                                {categories.length === 0 && !loading ? (
                                    <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>
                                        No categories found for this collection
                                    </div>
                                ) : (
                                    categories.map(category => (
                                    <div key={category.id} className="category-section">
                                        <div 
                                            className={`category-header ${expandedCategories.has(category.id) ? 'expanded' : ''}`}
                                            onClick={() => handleCategoryToggle(category)}
                                        >
                                            <div className="category-toggle">
                                                <span className="toggle-icon">
                                                    {expandedCategories.has(category.id) ? '▼' : '▶'}
                                                </span>
                                                <span className="category-name">{category.display_name}</span>
                                            </div>
                                            <div className="category-count">{category.item_count} items</div>
                                        </div>
                                        
                                        {expandedCategories.has(category.id) && (
                                            <div className="category-items">
                                                {categoryItems[category.id] ? (
                                                    categoryItems[category.id].length > 0 ? (
                                                        categoryItems[category.id].map(item => (
                                                            <div 
                                                                key={item.id}
                                                                className={`item-row ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                                                onClick={() => handleItemSelect(item)}
                                                            >
                                                                <div className="item-name">{item.display_name || item.classname}</div>
                                                                <div className="item-details">
                                                                    <span className="item-tier">T{item.tier}</span>
                                                                    <span className="item-nominal">N:{item.nominal}</span>
                                                                    <span className="item-min">M:{item.min}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="no-items">No items in this category</div>
                                                    )
                                                ) : (
                                                    <div className="loading-items">Loading items...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="panel-placeholder">
                            <div className="placeholder-content">
                                <h2>📂 Select a Collection</h2>
                                <p>Choose a collection from the sidebar to view categories and items</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Item Editor Panel - Always visible */}
                <div className="item-editor-panel">
                    {selectedItem ? (
                        <>
                            <div className="editor-header">
                                <h2>⚙️ Edit Item: {selectedItem.display_name || selectedItem.classname}</h2>
                                <button
                                    className="close-editor-btn"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="editor-content">
                                <div className="editor-section">
                                    <h3>📊 Basic Parameters</h3>
                                    <div className="param-grid">
                                        <div className="param-field">
                                            <label>Display Name:</label>
                                            <input
                                                type="text"
                                                value={selectedItem.display_name || selectedItem.classname}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, display_name: e.target.value })}
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Classname:</label>
                                            <input
                                                type="text"
                                                value={selectedItem.classname}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, classname: e.target.value })}
                                            />
                                        </div>

                                        <div className="param-field tier-selector">
                                            <label>Tiers:</label>
                                            <div className="tier-checkboxes">
                                                {[1, 2, 3, 4].map(tier => (
                                                    <label key={tier} className="tier-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={(selectedItem.tiers || []).includes(tier)}
                                                            onChange={(e) => {
                                                                const currentTiers = selectedItem.tiers || [];
                                                                let newTiers;
                                                                if (e.target.checked) {
                                                                    newTiers = [...currentTiers, tier].sort();
                                                                } else {
                                                                    newTiers = currentTiers.filter(t => t !== tier);
                                                                }
                                                                setSelectedItem({ 
                                                                    ...selectedItem, 
                                                                    tiers: newTiers,
                                                                    tier: newTiers[0] || 1 // mantém compatibilidade
                                                                });
                                                            }}
                                                        />
                                                        Tier {tier}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="editor-section">
                                    <h3>🎯 Spawn Parameters</h3>
                                    <div className="param-grid">
                                        <div className="param-field param-slider">
                                            <label>Quantity Min: {selectedItem.min || 0}%</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedItem.min || 0}
                                                onChange={(e) => {
                                                    const newMin = parseInt(e.target.value);
                                                    const currentMax = selectedItem.nominal || 0;
                                                    setSelectedItem({ 
                                                        ...selectedItem, 
                                                        min: newMin,
                                                        nominal: newMin > currentMax ? newMin : currentMax
                                                    });
                                                }}
                                                className="slider"
                                            />
                                            <div className="slider-track">
                                                <span>0%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>

                                        <div className="param-field param-slider">
                                            <label>Quantity Max: {selectedItem.nominal || 0}%</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedItem.nominal || 0}
                                                onChange={(e) => {
                                                    const newMax = parseInt(e.target.value);
                                                    const currentMin = selectedItem.min || 0;
                                                    setSelectedItem({ 
                                                        ...selectedItem, 
                                                        nominal: newMax,
                                                        min: newMax < currentMin ? newMax : currentMin
                                                    });
                                                }}
                                                className="slider"
                                            />
                                            <div className="slider-track">
                                                <span>0%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>

                                        <div className="param-field param-slider lifetime-slider">
                                            <label>Lifetime: {(() => {
                                                const lifetimeValues = [1, 2, 4, 24, 72, 168, 336, 720, -1]; // 1h, 2h, 4h, 1d, 3d, 1w, 2w, 1m, ∞
                                                const lifetimeLabels = ['1h', '2h', '4h', '1 day', '3 days', '1 week', '2 weeks', '1 month', '∞'];
                                                const currentIndex = lifetimeValues.findIndex(val => val === selectedItem.lifetime) || 0;
                                                return lifetimeLabels[currentIndex];
                                            })()}</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="8"
                                                step="1"
                                                value={(() => {
                                                    const lifetimeValues = [1, 2, 4, 24, 72, 168, 336, 720, -1];
                                                    const currentIndex = lifetimeValues.findIndex(val => val === selectedItem.lifetime);
                                                    return currentIndex >= 0 ? currentIndex : 0;
                                                })()}
                                                onChange={(e) => {
                                                    const lifetimeValues = [1, 2, 4, 24, 72, 168, 336, 720, -1]; // horas
                                                    const selectedIndex = parseInt(e.target.value);
                                                    setSelectedItem({ 
                                                        ...selectedItem, 
                                                        lifetime: lifetimeValues[selectedIndex]
                                                    });
                                                }}
                                                className="slider lifetime-range"
                                            />
                                            <div className="lifetime-labels">
                                                <span>1h</span>
                                                <span>2h</span>
                                                <span>4h</span>
                                                <span>1d</span>
                                                <span>3d</span>
                                                <span>1w</span>
                                                <span>2w</span>
                                                <span>1m</span>
                                                <span>∞</span>
                                            </div>
                                        </div>

                                        <div className="param-field">
                                            <label>Restock (seconds):</label>
                                            <input
                                                type="number"
                                                value={selectedItem.restock || 0}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, restock: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Price:</label>
                                            <input
                                                type="number"
                                                value={selectedItem.price || 100}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, price: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="editor-section">
                                    <h3>📊 Quantity Parameters</h3>
                                    <div className="param-grid">
                                        <div className="param-field">
                                            <label>QuantMin (-1 = auto):</label>
                                            <input
                                                type="number"
                                                value={selectedItem.quantmin || -1}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, quantmin: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>QuantMax (-1 = auto):</label>
                                            <input
                                                type="number"
                                                value={selectedItem.quantmax || -1}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, quantmax: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="editor-section">
                                    <h3>🏷️ Tags & Usage</h3>
                                    <div className="param-grid">
                                        <div className="param-field">
                                            <label>Tags (comma separated):</label>
                                            <input
                                                type="text"
                                                value={(selectedItem.tags || []).join(', ')}
                                                onChange={(e) => {
                                                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                                    setSelectedItem({ ...selectedItem, tags });
                                                }}
                                                placeholder="floor, shelves, ground"
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Usage (comma separated):</label>
                                            <input
                                                type="text"
                                                value={(selectedItem.usage || []).join(', ')}
                                                onChange={(e) => {
                                                    const usage = e.target.value.split(',').map(u => u.trim()).filter(u => u);
                                                    setSelectedItem({ ...selectedItem, usage });
                                                }}
                                                placeholder="Military, Police, Town"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="editor-section">
                                    <h3>🔧 Weapon Specific</h3>
                                    <div className="param-grid">
                                        <div className="param-field">
                                            <label>Ammo Types (comma separated):</label>
                                            <input
                                                type="text"
                                                value={(selectedItem.ammo_types || []).join(', ')}
                                                onChange={(e) => {
                                                    const ammo_types = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                                    setSelectedItem({ ...selectedItem, ammo_types });
                                                }}
                                                placeholder="Ammo_556x45, Ammo_762x39"
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Magazines (comma separated):</label>
                                            <input
                                                type="text"
                                                value={(selectedItem.magazines || []).join(', ')}
                                                onChange={(e) => {
                                                    const magazines = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                                                    setSelectedItem({ ...selectedItem, magazines });
                                                }}
                                                placeholder="Mag_STANAG_30Rnd, Mag_AK74_30Rnd"
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Attachments (comma separated):</label>
                                            <input
                                                type="text"
                                                value={(selectedItem.attachments || []).join(', ')}
                                                onChange={(e) => {
                                                    const attachments = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                                    setSelectedItem({ ...selectedItem, attachments });
                                                }}
                                                placeholder="M4_Suppressor, M4_OEBttstck"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="editor-section">
                                    <h3>🎯 Flags Configuration</h3>
                                    <div className="flags-grid">
                                        {[
                                            { key: 'count_in_cargo', label: 'Count in Cargo', type: 'checkbox' },
                                            { key: 'count_in_hoarder', label: 'Count in Hoarder', type: 'checkbox' },
                                            { key: 'count_in_map', label: 'Count in Map', type: 'checkbox' },
                                            { key: 'count_in_player', label: 'Count in Player', type: 'checkbox' },
                                            { key: 'crafted', label: 'Crafted', type: 'checkbox' },
                                            { key: 'deloot', label: 'Deloot', type: 'checkbox' }
                                        ].map(flag => (
                                            <div key={flag.key} className="flag-field">
                                                <label className="flag-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean((selectedItem.flags || {})[flag.key])}
                                                        onChange={(e) => {
                                                            const currentFlags = selectedItem.flags || {};
                                                            const newFlags = {
                                                                ...currentFlags,
                                                                [flag.key]: e.target.checked ? 1 : 0
                                                            };
                                                            setSelectedItem({ ...selectedItem, flags: newFlags });
                                                        }}
                                                    />
                                                    {flag.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="editor-actions">
                                    <button className="save-btn">💾 Save Changes</button>
                                    <button className="revert-btn">↺ Revert Changes</button>
                                    <button className="export-btn">📄 Export JSON</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="editor-placeholder">
                            <div className="placeholder-content">
                                <h2>⚙️ Item Editor</h2>
                                <p>Select an item from the categories to start editing</p>
                                <div className="placeholder-icon">📝</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <span>Collections: {collections.length}</span>
                {selectedCollection && <span>Categories: {categories.length}</span>}
                {selectedItem && <span>Editing: {selectedItem.display_name || selectedItem.classname}</span>}
                <span className="status-right">DayZ Economy Editor v2.0</span>
            </div>
        </div>
    );
};

export default CollectionsView;