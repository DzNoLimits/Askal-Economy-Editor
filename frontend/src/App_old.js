import React from 'react';
import './App.css';
import CollectionsView from './components/CollectionsView';

function App() {
    return (
        <div className="app">
            <CollectionsView />
        </div>
    );
}

    const handleItemSelect = async (item) => {
        try {
            setLoading(true);
            // Buscar dados completos do item com expand=true
            const response = await axios.get(`${API_URL}/items/${item.id}?expand=true`);
            setSelectedItem(response.data);
            fetchVariants(item.id);
        } catch (err) {
            console.error('Failed to load item details:', err);
            setSelectedItem(item); // Fallback para dados básicos
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async (itemId) => {
        try {
            const response = await axios.get(`${API_URL}/variants?item_id=${itemId}`);
            setVariants(response.data);
        } catch (err) {
            console.error('Failed to load variants:', err);
        }
    };

    // Placeholder handlers - implementar conforme necessário
    const handleCreateCategory = () => {
        console.log('Create category');
    };

    const handleDeleteCategory = () => {
        console.log('Delete category');
    };

    const handleCreateItem = () => {
        console.log('Create item');
    };

    const handleDeleteItem = () => {
        console.log('Delete item');
    };

    const handleItemUpdate = () => {
        console.log('Update item');
    };

    const handleCreateVariant = () => {
        console.log('Create variant');
    };

    const handleVariantUpdate = () => {
        console.log('Update variant');
    };

    const handleDeleteVariant = () => {
        console.log('Delete variant');
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>DayZ Economy Editor Beta</h1>
            </header>

            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="app-content">
                <aside className="sidebar">
                    <div className="category-list">
                        <div className="category-list-header">
                            <h2>Categories</h2>
                        </div>
                        <ul className="category-items">
                            {categories.map(category => (
                                <li
                                    key={category.id}
                                    className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                                    onClick={() => handleCategorySelect(category)}
                                >
                                    <div className="category-info">
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-stats">
                                            Tier: {category.tier} | Price: ${category.price}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="main-grid">
                        <div className="items-section">
                            <div className="item-list">
                                <div className="item-list-header">
                                    <h2>{selectedCategory ? `Items in ${selectedCategory.name}` : 'Select a category'}</h2>
                                </div>

                                {loading ? (
                                    <div className="loading">Loading...</div>
                                ) : selectedCategory ? (
                                    <ul className="item-items">
                                        {items.map(item => (
                                            <li
                                                key={item.id}
                                                className={`item-item ${selectedItem?.id === item.id ? 'active' : ''}`}
                                                onClick={() => handleItemSelect(item)}
                                            >
                                                <div className="item-info">
                                                    <span className="item-classname">{item.classname}</span>
                                                    <div className="item-stats">
                                                        <span>Tier: {item.tier}</span>
                                                        <span>Price: ${item.price}</span>
                                                        <span>Nominal: {item.nominal}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="empty-state">
                                        <p>Select a category to view items</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedItem && (
                            <div className="details-section">
                                <ItemDetailsV04 item={selectedItem} />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
