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
            const response = await fetch('http://localhost:3003/api/collections');
            const data = await response.json();
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
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
        return <div className="loading">Loading Collections...</div>;
    }

    return (
        <div className="collections-view">
            <header className="collections-header">
                <h1>🗂️ DayZ Economy Editor v2.0</h1>
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
                            </div>
                            
                            <div className="categories-list">
                                {categories.map(category => (
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
                                ))}
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

                                        <div className="param-field">
                                            <label>Tier:</label>
                                            <select
                                                value={selectedItem.tier}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, tier: parseInt(e.target.value) })}
                                            >
                                                <option value={1}>Tier 1</option>
                                                <option value={2}>Tier 2</option>
                                                <option value={3}>Tier 3</option>
                                                <option value={4}>Tier 4</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="editor-section">
                                    <h3>🎯 Spawn Parameters</h3>
                                    <div className="param-grid">
                                        <div className="param-field">
                                            <label>Nominal:</label>
                                            <input
                                                type="number"
                                                value={selectedItem.nominal}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, nominal: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Min:</label>
                                            <input
                                                type="number"
                                                value={selectedItem.min}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, min: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Lifetime (hours):</label>
                                            <input
                                                type="number"
                                                value={selectedItem.lifetime}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, lifetime: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div className="param-field">
                                            <label>Restock:</label>
                                            <input
                                                type="number"
                                                value={selectedItem.restock}
                                                onChange={(e) => setSelectedItem({ ...selectedItem, restock: parseInt(e.target.value) })}
                                            />
                                        </div>
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

                                    <div className="param-field">
                                        <label>Tier:</label>
                                        <select
                                            value={selectedItem.tier}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, tier: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>Tier 1</option>
                                            <option value={2}>Tier 2</option>
                                            <option value={3}>Tier 3</option>
                                            <option value={4}>Tier 4</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="editor-section">
                                <h3>🎯 Spawn Parameters</h3>
                                <div className="param-grid">
                                    <div className="param-field">
                                        <label>Nominal:</label>
                                        <input
                                            type="number"
                                            value={selectedItem.nominal}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, nominal: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="param-field">
                                        <label>Min:</label>
                                        <input
                                            type="number"
                                            value={selectedItem.min}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, min: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="param-field">
                                        <label>Lifetime (hours):</label>
                                        <input
                                            type="number"
                                            value={Math.floor(selectedItem.lifetime / 3600)}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, lifetime: parseInt(e.target.value) * 3600 })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="editor-section">
                                <h3>🎨 Variants</h3>
                                {selectedItem.variants && selectedItem.variants.length > 0 ? (
                                    <div className="variants-editor">
                                        {selectedItem.variants.map((variant, index) => (
                                            <div key={variant.id} className="variant-editor">
                                                <input
                                                    type="text"
                                                    value={variant.display_name || variant.name}
                                                    onChange={(e) => {
                                                        const newVariants = [...selectedItem.variants];
                                                        newVariants[index] = { ...variant, display_name: e.target.value };
                                                        setSelectedItem({ ...selectedItem, variants: newVariants });
                                                    }}
                                                />
                                                <button
                                                    className="remove-variant-btn"
                                                    onClick={() => {
                                                        const newVariants = selectedItem.variants.filter((_, i) => i !== index);
                                                        setSelectedItem({ ...selectedItem, variants: newVariants });
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                        <button className="add-variant-btn">+ Add Variant</button>
                                    </div>
                                ) : (
                                    <p>No variants for this item.</p>
                                )}
                            </div>

                            <div className="editor-actions">
                                <button className="save-btn">💾 Save Changes</button>
                                <button className="revert-btn">↺ Revert Changes</button>
                                <button className="export-btn">📄 Export JSON</button>
                            </div>
                        </div>
                    </>
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