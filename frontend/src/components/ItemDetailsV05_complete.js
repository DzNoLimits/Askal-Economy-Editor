import React, { useState, useEffect } from 'react';
import './ItemDetailsV05.css';

const ItemDetailsV05 = ({ item, onUpdateItem, categories = [] }) => {
  const [formData, setFormData] = useState({
    classname: '',
    category_id: '',
    nominal: 10,
    min: 5,
    quantmin: 50,
    quantmax: 80,
    tier: [1], // Array para múltiplos tiers
    price: 100,
    lifetime: 14400,
    restock: 1800,
    flags: {
      Dispatch: false,
      Events: true,
      Market: true,
      P2P: true,
      Secure: true,
      Store: true
    },
    // Baseado no cfglimitsdefinition.xml
    tags: [], // floor, shelves, ground
    usage: [], // Military, Police, Medic, etc.
    category: '' // tools, containers, clothes, etc.
  });

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        classname: item.classname || '',
        category_id: item.category_id || '',
        nominal: item.nominal || 10,
        min: item.min || 5,
        quantmin: item.quantmin || 50,
        quantmax: item.quantmax || 80,
        tier: Array.isArray(item.tier) ? item.tier : [item.tier || 1],
        price: item.price || 100,
        lifetime: item.lifetime || 14400,
        restock: item.restock || 1800,
        flags: {
          Dispatch: item.flags?.Dispatch ?? false,
          Events: item.flags?.Events ?? true,
          Market: item.flags?.Market ?? true,
          P2P: item.flags?.P2P ?? true,
          Secure: item.flags?.Secure ?? true,
          Store: item.flags?.Store ?? true
        },
        tags: item.tags || [],
        usage: item.usage || [],
        category: item.category || ''
      });
    }
  }, [item]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFlagToggle = (flagName) => {
    setFormData(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        [flagName]: !prev.flags[flagName]
      }
    }));
  };

  const handleTierToggle = (tierNumber) => {
    setFormData(prev => {
      const newTiers = prev.tier.includes(tierNumber)
        ? prev.tier.filter(t => t !== tierNumber)
        : [...prev.tier, tierNumber].sort((a, b) => a - b);
      
      return {
        ...prev,
        tier: newTiers.length > 0 ? newTiers : [1] // Sempre manter pelo menos tier 1
      };
    });
  };

  const handleQuantSlider = (type, value) => {
    if (type === 'quantmin') {
      const newValue = value === 0 ? -1 : value;
      setFormData(prev => ({
        ...prev,
        quantmin: newValue,
        quantmax: newValue > prev.quantmax ? newValue : prev.quantmax
      }));
    } else if (type === 'quantmax') {
      const newValue = value === 0 ? -1 : value;
      setFormData(prev => ({
        ...prev,
        quantmax: newValue,
        quantmin: newValue < prev.quantmin ? newValue : prev.quantmin
      }));
    }
  };

  const getLifetimeLabel = (seconds) => {
    const options = [
      { value: 3600, label: '1h' },
      { value: 7200, label: '2h' },
      { value: 14400, label: '4h' },
      { value: 86400, label: '1d' },
      { value: 259200, label: '3d' },
      { value: 604800, label: '1w' },
      { value: 1209600, label: '2w' },
      { value: 2592000, label: '1m' },
      { value: -1, label: '∞' }
    ];
    
    const option = options.find(opt => opt.value === seconds);
    return option ? option.label : `${Math.floor(seconds / 3600)}h`;
  };

  const getRestockLabel = (seconds) => {
    const options = [
      { value: 0, label: '0' },
      { value: 60, label: '1min' },
      { value: 600, label: '10min' },
      { value: 1800, label: '30min' },
      { value: 3600, label: '1h' },
      { value: 14400, label: '4h' }
    ];
    
    const option = options.find(opt => opt.value === seconds);
    return option ? option.label : `${Math.floor(seconds / 60)}min`;
  };

  const handleSave = () => {
    if (onUpdateItem) {
      onUpdateItem({
        ...item,
        ...formData
      });
    }
  };

  if (!item) {
    return (
      <div className="item-details">
        <h3>⚙️ Item Editor</h3>
        <p>Selecione um item para editar</p>
      </div>
    );
  }

  return (
    <div className="item-details">
      <div className="item-details-header">
        <h3>⚙️ Edit Item</h3>
        <button className="save-btn" onClick={handleSave}>
          💾 Save
        </button>
      </div>

      <div className="item-details-content">
        
        {/* BLOCO - Basic Parameters */}
        <div className="parameter-section">
          <h4>🔧 Basic Parameters</h4>
          
          {/* Classname + Price lado a lado */}
          <div className="parameter-row">
            <div className="parameter-group">
              <label>Classname:</label>
              <input
                type="text"
                value={formData.classname}
                onChange={(e) => handleInputChange('classname', e.target.value)}
                placeholder="Item classname"
              />
            </div>
            <div className="parameter-group">
              <label>Price:</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                min="0"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="parameter-group">
            <label>Flags:</label>
            <div className="flags-grid">
              {Object.entries(formData.flags).map(([flagName, isActive]) => (
                <button
                  key={flagName}
                  className={`flag-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleFlagToggle(flagName)}
                >
                  {flagName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BLOCO - Central Economy Parameters */}
        <div className="parameter-section">
          <h4>💰 Central Economy Parameters</h4>
          
          {/* Category */}
          <div className="parameter-group">
            <label>Category:</label>
            <div className="category-buttons">
              {['tools', 'containers', 'clothes', 'lootdispatch', 'food', 'weapons', 'books', 'explosives'].map(cat => (
                <button
                  key={cat}
                  className={`toggle-btn ${formData.category === cat ? 'active' : ''}`}
                  onClick={() => handleInputChange('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Usage e Tags reorganizados */}
          <div className="parameter-group">
            <label>Usage:</label>
            <div className="usage-buttons">
              {['Military', 'Police', 'Medic', 'Firefighter', 'Industrial', 'Farm', 'Coast', 'Town', 'Village', 'Hunting', 'Office', 'School', 'Prison', 'Lunapark', 'SeasonalEvent', 'ContaminatedArea', 'Historical'].map(usage => (
                <button
                  key={usage}
                  className={`toggle-btn ${formData.usage.includes(usage) ? 'active' : ''}`}
                  onClick={() => {
                    const newUsage = formData.usage.includes(usage)
                      ? formData.usage.filter(u => u !== usage)
                      : [...formData.usage, usage];
                    handleInputChange('usage', newUsage);
                  }}
                >
                  {usage}
                </button>
              ))}
            </div>
            
            <label style={{ marginTop: '1rem' }}>Tags:</label>
            <div className="tags-buttons">
              {['floor', 'shelves', 'ground'].map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${formData.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => {
                    const newTags = formData.tags.includes(tag)
                      ? formData.tags.filter(t => t !== tag)
                      : [...formData.tags, tag];
                    handleInputChange('tags', newTags);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tiers */}
          <div className="parameter-group">
            <label>Tiers:</label>
            <div className="tier-buttons">
              {[1, 2, 3, 4, 'Unique'].map(tierNum => (
                <button
                  key={tierNum}
                  className={`tier-btn ${formData.tier.includes(tierNum) ? 'active' : ''}`}
                  onClick={() => handleTierToggle(tierNum)}
                >
                  {tierNum === 'Unique' ? 'Unique' : `Tier${tierNum}`}
                </button>
              ))}
            </div>
            <span className="tier-display">Selected: {formData.tier.join(', ')}</span>
          </div>

          {/* Economy Values Subblock */}
          <div className="economy-values-subblock">
            <h5>💰 Economy Values</h5>
            
            {/* Primeira linha: Nominal + Min | QuantMax + QuantMin */}
            <div className="parameter-row economy-row-4col">
              <div className="parameter-group">
                <label>Nominal:</label>
                <input
                  type="number"
                  value={formData.nominal}
                  onChange={(e) => handleInputChange('nominal', parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div className="parameter-group">
                <label>Min:</label>
                <input
                  type="number"
                  value={formData.min}
                  onChange={(e) => handleInputChange('min', parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div className="parameter-group">
                <label>QuantMax: {formData.quantmax === -1 ? 'Auto (-1)' : `${formData.quantmax}%`}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.quantmax === -1 ? 0 : formData.quantmax}
                  onChange={(e) => handleQuantSlider('quantmax', parseInt(e.target.value))}
                  className="quantity-slider quantmax"
                />
              </div>
              <div className="parameter-group">
                <label>QuantMin: {formData.quantmin === -1 ? 'Auto (-1)' : `${formData.quantmin}%`}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.quantmin === -1 ? 0 : formData.quantmin}
                  onChange={(e) => handleQuantSlider('quantmin', parseInt(e.target.value))}
                  className="quantity-slider quantmin"
                />
              </div>
            </div>

            {/* Segunda linha: Lifetime + Restock (spans full width) */}
            <div className="parameter-row lifetime-restock-row">
              <div className="parameter-group lifetime-group">
                <label>Lifetime: {getLifetimeLabel(formData.lifetime)}</label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={[3600, 7200, 14400, 86400, 259200, 604800, 1209600, 2592000, -1].indexOf(formData.lifetime)}
                  onChange={(e) => {
                    const values = [3600, 7200, 14400, 86400, 259200, 604800, 1209600, 2592000, -1];
                    handleInputChange('lifetime', values[parseInt(e.target.value)]);
                  }}
                  className="lifetime-slider"
                />
              </div>

              <div className="parameter-group restock-group">
                <label>Restock: {getRestockLabel(formData.restock)}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={[0, 60, 600, 1800, 3600, 14400].indexOf(formData.restock)}
                  onChange={(e) => {
                    const values = [0, 60, 600, 1800, 3600, 14400];
                    handleInputChange('restock', values[parseInt(e.target.value)]);
                  }}
                  className="restock-slider"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemDetailsV05;