import React, { useState } from 'react';
import './VariantList.css';

function VariantList({ variants, item, onCreateVariant, onUpdateVariant, onDeleteVariant }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [newVariant, setNewVariant] = useState({
    name: '',
    tier: '',
    price: '',
    lifetime: '',
    restock: '',
    min: '',
    nominal: '',
    quantmin: '',
    quantmax: ''
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newVariant.name.trim()) {
      const variantData = {};
      Object.keys(newVariant).forEach(key => {
        if (newVariant[key] !== '') {
          variantData[key] = key === 'name' ? newVariant[key] : parseInt(newVariant[key]);
        }
      });
      onCreateVariant(variantData);
      setNewVariant({
        name: '',
        tier: '',
        price: '',
        lifetime: '',
        restock: '',
        min: '',
        nominal: '',
        quantmin: '',
        quantmax: ''
      });
      setShowCreateForm(false);
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant({
      ...variant,
      tier: variant.tier || '',
      price: variant.price || '',
      lifetime: variant.lifetime || '',
      restock: variant.restock || '',
      min: variant.min || '',
      nominal: variant.nominal || '',
      quantmin: variant.quantmin || '',
      quantmax: variant.quantmax || ''
    });
  };

  const handleUpdate = () => {
    const updatedData = {};
    Object.keys(editingVariant).forEach(key => {
      if (key !== 'id' && key !== 'item_id' && editingVariant[key] !== '') {
        updatedData[key] = ['name', 'flags', 'tags', 'usage', 'ammo_types', 'magazines', 'attachments'].includes(key) 
          ? editingVariant[key] 
          : parseInt(editingVariant[key]);
      }
    });
    onUpdateVariant(editingVariant.id, updatedData);
    setEditingVariant(null);
  };

  const getDisplayValue = (variant, field) => {
    return variant[field] !== null && variant[field] !== undefined ? variant[field] : `(${item[field]})`;
  };

  return (
    <div className="variant-list">
      <div className="variant-header">
        <h3>Variants</h3>
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
            placeholder="Variant name"
            value={newVariant.name}
            onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
            required
          />
          <div className="form-grid">
            <input
              type="number"
              placeholder={`Tier (${item.tier})`}
              value={newVariant.tier}
              onChange={(e) => setNewVariant({...newVariant, tier: e.target.value})}
            />
            <input
              type="number"
              placeholder={`Price (${item.price})`}
              value={newVariant.price}
              onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
            />
            <input
              type="number"
              placeholder={`Lifetime (${item.lifetime})`}
              value={newVariant.lifetime}
              onChange={(e) => setNewVariant({...newVariant, lifetime: e.target.value})}
            />
            <input
              type="number"
              placeholder={`Nominal (${item.nominal})`}
              value={newVariant.nominal}
              onChange={(e) => setNewVariant({...newVariant, nominal: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">Create</button>
            <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="variant-items">
        {variants.length === 0 ? (
          <div className="empty-state">
            <p>No variants yet. Create one!</p>
          </div>
        ) : (
          variants.map(variant => (
            <div key={variant.id} className="variant-item">
              {editingVariant && editingVariant.id === variant.id ? (
                <div className="variant-edit">
                  <input
                    type="text"
                    value={editingVariant.name}
                    onChange={(e) => setEditingVariant({...editingVariant, name: e.target.value})}
                  />
                  <div className="edit-grid">
                    <input
                      type="number"
                      placeholder={`Tier (${item.tier})`}
                      value={editingVariant.tier}
                      onChange={(e) => setEditingVariant({...editingVariant, tier: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder={`Price (${item.price})`}
                      value={editingVariant.price}
                      onChange={(e) => setEditingVariant({...editingVariant, price: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder={`Lifetime (${item.lifetime})`}
                      value={editingVariant.lifetime}
                      onChange={(e) => setEditingVariant({...editingVariant, lifetime: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder={`Nominal (${item.nominal})`}
                      value={editingVariant.nominal}
                      onChange={(e) => setEditingVariant({...editingVariant, nominal: e.target.value})}
                    />
                  </div>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleUpdate}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingVariant(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="variant-info">
                    <h4>{variant.name}</h4>
                    <div className="variant-stats">
                      <span>Tier: {getDisplayValue(variant, 'tier')}</span>
                      <span>Price: ${getDisplayValue(variant, 'price')}</span>
                      <span>Lifetime: {getDisplayValue(variant, 'lifetime')}</span>
                      <span>Nominal: {getDisplayValue(variant, 'nominal')}</span>
                    </div>
                  </div>
                  <div className="variant-actions">
                    <button className="btn-edit" onClick={() => handleEdit(variant)}>Edit</button>
                    <button className="btn-delete" onClick={() => onDeleteVariant(variant.id)}>×</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VariantList;
