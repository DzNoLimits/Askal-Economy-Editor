import React, { useState } from 'react';
import './ItemList.css';

function ItemList({ items, selectedItem, selectedCategory, onSelectItem, onCreateItem, onDeleteItem, loading }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItem, setNewItem] = useState({
    classname: '',
    tier: 1,
    price: 100,
    lifetime: 3888000,
    restock: 0,
    min: 0,
    nominal: 10,
    quantmin: -1,
    quantmax: -1
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newItem.classname.trim() && selectedCategory) {
      onCreateItem({
        ...newItem,
        category_id: selectedCategory.id,
        flags: {
          count_in_cargo: 0,
          count_in_hoarder: 0,
          count_in_map: 1,
          count_in_player: 0,
          crafted: 0,
          deloot: 0
        },
        tags: [],
        usage: [],
        ammo_types: [],
        magazines: [],
        attachments: []
      });
      setNewItem({
        classname: '',
        tier: 1,
        price: 100,
        lifetime: 3888000,
        restock: 0,
        min: 0,
        nominal: 10,
        quantmin: -1,
        quantmax: -1
      });
      setShowCreateForm(false);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="item-list">
        <div className="empty-state">
          <p>Select a category to view items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="item-list">
      <div className="item-list-header">
        <h2>Items in {selectedCategory.name}</h2>
        <button 
          className="btn-add"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form className="create-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Classname"
            value={newItem.classname}
            onChange={(e) => setNewItem({...newItem, classname: e.target.value})}
            required
          />
          <div className="form-row">
            <input
              type="number"
              placeholder="Tier"
              value={newItem.tier}
              onChange={(e) => setNewItem({...newItem, tier: parseInt(e.target.value)})}
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: parseInt(e.target.value)})}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <ul className="item-items">
          {items.map(item => (
            <li 
              key={item.id}
              className={`item-item ${selectedItem?.id === item.id ? 'active' : ''}`}
              onClick={() => onSelectItem(item)}
            >
              <div className="item-info">
                <span className="item-classname">{item.classname}</span>
                <div className="item-stats">
                  <span>Tier: {item.tier}</span>
                  <span>Price: ${item.price}</span>
                  <span>Nominal: {item.nominal}</span>
                </div>
              </div>
              <button 
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ItemList;
