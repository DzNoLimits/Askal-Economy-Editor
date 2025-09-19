import React, { useState, useEffect } from 'react';
import './CollectionsView.css';

const CollectionsView = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carregar Collections
    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            console.log('🔍 Testing API connection...');

            // Testar conexão básica
            const response = await fetch('http://localhost:3003/api/collections');
            console.log('📡 Response status:', response.status);
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
        setItems([]);
        fetchItems(category.id);
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
                                        {collection.category_count} categories • {collection.item_count} items
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Panel */}
                {selectedCollection && (
                    <div className="categories-panel">
                        <h2>📂 Categories in {selectedCollection.display_name}</h2>
                        <div className="categories-grid">
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    className={`category-card ${selectedCategory?.id === category.id ? 'selected' : ''}`}
                                    onClick={() => handleCategorySelect(category)}
                                >
                                    <div className="category-name">{category.display_name}</div>
                                    <div className="category-description">{category.description}</div>
                                    <div className="category-count">{category.item_count} items</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Items Panel */}
                {selectedCategory && (
                    <div className="items-panel">
                        <h2>📄 Items in {selectedCategory.display_name}</h2>
                        {items.length > 0 ? (
                            <div className="items-list">
                                {items.map(item => (
                                    <div key={item.id} className="item-card">
                                        <div className="item-header">
                                            <div className="item-name">{item.display_name || item.classname}</div>
                                            <div className="item-tier">Tier {item.tier}</div>
                                        </div>
                                        <div className="item-classname">{item.classname}</div>
                                        <div className="item-stats">
                                            <span>Nominal: {item.nominal}</span>
                                            <span>Min: {item.min}</span>
                                            <span>Lifetime: {Math.floor(item.lifetime / 3600)}h</span>
                                        </div>
                                        {item.variants && item.variants.length > 0 && (
                                            <div className="item-variants">
                                                <strong>🎨 Variants ({item.variants.length}):</strong>
                                                <div className="variants-list">
                                                    {item.variants.map(variant => (
                                                        <span key={variant.id} className="variant-tag">
                                                            {variant.display_name || variant.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-items">
                                <p>No items in this category yet.</p>
                                <p>This is where items would be displayed from JSON files.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="status-bar">
                <span>Collections: {collections.length}</span>
                {selectedCollection && <span>Categories: {categories.length}</span>}
                {selectedCategory && <span>Items: {items.length}</span>}
                <span className="status-right">Ready for JSON import</span>
            </div>
        </div>
    );
};

export default CollectionsView;