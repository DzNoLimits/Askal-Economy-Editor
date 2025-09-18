import React, { useState, useEffect } from 'react';
import './ItemDetails.css';

function ItemDetails({ item, onUpdateItem }) {
  const [editedItem, setEditedItem] = useState(item);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedItem(item);
    setHasChanges(false);
  }, [item]);

  const handleChange = (field, value) => {
    setEditedItem({
      ...editedItem,
      [field]: value
    });
    setHasChanges(true);
  };

  const handleFlagChange = (flag, value) => {
    setEditedItem({
      ...editedItem,
      flags: {
        ...editedItem.flags,
        [flag]: value ? 1 : 0
      }
    });
    setHasChanges(true);
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...editedItem[field]];
    newArray[index] = value;
    setEditedItem({
      ...editedItem,
      [field]: newArray
    });
    setHasChanges(true);
  };

  const handleArrayAdd = (field) => {
    setEditedItem({
      ...editedItem,
      [field]: [...editedItem[field], '']
    });
    setHasChanges(true);
  };

  const handleArrayRemove = (field, index) => {
    const newArray = editedItem[field].filter((_, i) => i !== index);
    setEditedItem({
      ...editedItem,
      [field]: newArray
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateItem(editedItem);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditedItem(item);
    setHasChanges(false);
  };

  return (
    <div className="item-details">
      <div className="details-header">
        <h3>Item Details: {item.classname}</h3>
        {hasChanges && (
          <div className="action-buttons">
            <button className="btn-save" onClick={handleSave}>Save Changes</button>
            <button className="btn-reset" onClick={handleReset}>Reset</button>
          </div>
        )}
      </div>

      <div className="details-content">
        <div className="detail-section">
          <h4>Basic Information</h4>
          <div className="detail-grid">
            <div className="detail-field">
              <label>Classname</label>
              <input
                type="text"
                value={editedItem.classname}
                onChange={(e) => handleChange('classname', e.target.value)}
              />
            </div>
            <div className="detail-field">
              <label>Tier</label>
              <input
                type="number"
                value={editedItem.tier}
                onChange={(e) => handleChange('tier', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Price</label>
              <input
                type="number"
                value={editedItem.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Lifetime</label>
              <input
                type="number"
                value={editedItem.lifetime}
                onChange={(e) => handleChange('lifetime', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Restock</label>
              <input
                type="number"
                value={editedItem.restock}
                onChange={(e) => handleChange('restock', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Min</label>
              <input
                type="number"
                value={editedItem.min}
                onChange={(e) => handleChange('min', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Nominal</label>
              <input
                type="number"
                value={editedItem.nominal}
                onChange={(e) => handleChange('nominal', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Quant Min</label>
              <input
                type="number"
                value={editedItem.quantmin}
                onChange={(e) => handleChange('quantmin', parseInt(e.target.value))}
              />
            </div>
            <div className="detail-field">
              <label>Quant Max</label>
              <input
                type="number"
                value={editedItem.quantmax}
                onChange={(e) => handleChange('quantmax', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Flags</h4>
          <div className="flags-grid">
            {Object.entries({
              count_in_cargo: 'Count in Cargo',
              count_in_hoarder: 'Count in Hoarder',
              count_in_map: 'Count in Map',
              count_in_player: 'Count in Player',
              crafted: 'Crafted',
              deloot: 'Deloot'
            }).map(([flag, label]) => (
              <label key={flag} className="flag-checkbox">
                <input
                  type="checkbox"
                  checked={editedItem.flags[flag] === 1}
                  onChange={(e) => handleFlagChange(flag, e.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h4>Tags</h4>
          <div className="array-editor">
            {editedItem.tags.map((tag, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                />
                <button onClick={() => handleArrayRemove('tags', index)}>×</button>
              </div>
            ))}
            <button className="btn-add-item" onClick={() => handleArrayAdd('tags')}>Add Tag</button>
          </div>
        </div>

        <div className="detail-section">
          <h4>Usage</h4>
          <div className="array-editor">
            {editedItem.usage.map((use, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={use}
                  onChange={(e) => handleArrayChange('usage', index, e.target.value)}
                />
                <button onClick={() => handleArrayRemove('usage', index)}>×</button>
              </div>
            ))}
            <button className="btn-add-item" onClick={() => handleArrayAdd('usage')}>Add Usage</button>
          </div>
        </div>

        <div className="detail-section">
          <h4>Ammo Types</h4>
          <div className="array-editor">
            {editedItem.ammo_types.map((ammo, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={ammo}
                  onChange={(e) => handleArrayChange('ammo_types', index, e.target.value)}
                />
                <button onClick={() => handleArrayRemove('ammo_types', index)}>×</button>
              </div>
            ))}
            <button className="btn-add-item" onClick={() => handleArrayAdd('ammo_types')}>Add Ammo Type</button>
          </div>
        </div>

        <div className="detail-section">
          <h4>Magazines</h4>
          <div className="array-editor">
            {editedItem.magazines.map((mag, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={mag}
                  onChange={(e) => handleArrayChange('magazines', index, e.target.value)}
                />
                <button onClick={() => handleArrayRemove('magazines', index)}>×</button>
              </div>
            ))}
            <button className="btn-add-item" onClick={() => handleArrayAdd('magazines')}>Add Magazine</button>
          </div>
        </div>

        <div className="detail-section">
          <h4>Attachments</h4>
          <div className="array-editor">
            {editedItem.attachments.map((att, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={att}
                  onChange={(e) => handleArrayChange('attachments', index, e.target.value)}
                />
                <button onClick={() => handleArrayRemove('attachments', index)}>×</button>
              </div>
            ))}
            <button className="btn-add-item" onClick={() => handleArrayAdd('attachments')}>Add Attachment</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
