import React, { useState } from 'react';
import './CategoryList.css';

function CategoryList({ categories, selectedCategory, onSelectCategory, onCreateCategory, onDeleteCategory }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    restock: 0,
    price: 100,
    tier: 1,
    lifetime: 3888000,
    min: 0,
    nominal: 10,
    quantmin: -1,
    quantmax: -1
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      onCreateCategory({
        ...newCategory,
        flags: {
          count_in_cargo: 0,
          count_in_hoarder: 0,
          count_in_map: 1,
          count_in_player: 0,
          crafted: 0,
          deloot: 0
        }
      });
      setNewCategory({
        name: '',
        restock: 0,
        price: 100,
        tier: 1,
        lifetime: 3888000,
        min: 0,
        nominal: 10,
        quantmin: -1,
        quantmax: -1
      });
      setShowCreateForm(false);
    }
  };

  return (
    <div className="category-list">
      <div className="category-list-header">
        <h2>Categories</h2>
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
            placeholder="Category name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newCategory.price}
            onChange={(e) => setNewCategory({...newCategory, price: parseInt(e.target.value)})}
          />
          <div className="form-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <ul className="category-items">
        {categories.map(category => (
          <li 
            key={category.id}
            className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            <div className="category-info">
              <span className="category-name">{category.name}</span>
              <span className="category-stats">
                Tier: {category.tier} | Price: ${category.price}
              </span>
            </div>
            <button 
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(category.id);
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryList;
