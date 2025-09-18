import React, { useState, useEffect } from 'react';
import './ItemDetailsV04.css';

const ItemDetailsV04 = ({ item, onUpdateItem, categories }) => {
  const [formData, setFormData] = useState({
    classname: '',
    category_id: '',
    nominal: '',
               <div className="form-group">
              <label>Lifetime: {getLifetimeLabel(formData.lifetime)}</label>
              <input
                type="range"
                name="lifetime"
                value={getLifetimeSliderValue(formData.lifetime)}
                min="0"
                max="8"
                step="1"
                onChange={handleLifetimeChange}
                className="slider lifetime-slider"
              />
              <div className="lifetime-markers">
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
    quantmin: -1,
    quantmax: -1,
    tier: 1,
    price: 100,
    lifetime: 14400,
    restock: 1800,
    flags: {
      Events: true,
      Market: true,
      P2P: true,
      Secure: true,
      Store: true,
      Dispatch: false
    },
    tags: [],
    usage: [],
    ammo_types: [],
    magazines: []
  });

  const [variants, setVariants] = useState([]);
  const [attachments, setAttachments] = useState({});
  const [availableOptions, setAvailableOptions] = useState({
    tags: [],
    usage: [],
    ammoTypes: [],
    magazines: [],
    attachmentTypes: []
  });

  useEffect(() => {
    if (item) {
      setFormData({
        classname: item.classname || '',
        category_id: item.category_id || '',
        nominal: item.nominal || '',
        min: item.min || '',
        quantmin: item.quantmin || -1,
        quantmax: item.quantmax || -1,
        tier: item.tier || 1,
        price: item.price || 100,
        lifetime: item.lifetime || 14400,
        restock: item.restock || 1800,
        flags: item.flags || {
          Events: true,
          Market: true,
          P2P: true,
          Secure: true,
          Store: true,
          Dispatch: false
        },
        tags: item.tags || [],
        usage: item.usage || [],
        ammo_types: item.ammo_types || [],
        magazines: item.magazines || []
      });
      setVariants(item.variants || []);
      setAttachments(item.attachments || {});
    }
  }, [item]);

  useEffect(() => {
    // Carregar opções disponíveis
    fetchAvailableOptions();
  }, []);

  const fetchAvailableOptions = async () => {
    try {
      const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
      const [tagsRes, usageRes, ammoRes, magsRes, attTypesRes] = await Promise.all([
        fetch(`${API_BASE}/tags`),
        fetch(`${API_BASE}/usage`),
        fetch(`${API_BASE}/ammo-types`),
        fetch(`${API_BASE}/magazines`),
        fetch(`${API_BASE}/attachment-types`)
      ]);

      const [tags, usage, ammoTypes, magazines, attachmentTypes] = await Promise.all([
        tagsRes.json(),
        usageRes.json(),
        ammoRes.json(),
        magsRes.json(),
        attTypesRes.json()
      ]);

      setAvailableOptions({
        tags,
        usage,
        ammoTypes,
        magazines,
        attachmentTypes
      });
    } catch (error) {
      console.error('Error fetching available options:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleFlagChange = (flagName) => {
    setFormData(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        [flagName]: !prev.flags[flagName]
      }
    }));
  };

  const handleArrayAdd = (arrayName, value) => {
    if (value && !formData[arrayName].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value]
      }));
    }
  };

  const handleArrayRemove = (arrayName, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateItem(item.id, formData);
  };

  if (!item) {
    return <div className="item-details-v04">Select an item to edit</div>;
  }

  return (
    <div className="item-details-v04">
      <div className="item-header">
        <h2>Edit Item: {item.classname}</h2>
        <span className="item-category">Category: {item.category}</span>
      </div>

      <form onSubmit={handleSubmit} className="item-form">
        {/* Basic Properties */}
        <div className="form-section">
          <h3>Basic Properties</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Classname:</label>
              <input
                type="text"
                name="classname"
                value={formData.classname}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category:</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {(categories || []).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nominal:</label>
              <input
                type="number"
                name="nominal"
                value={formData.nominal}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Min:</label>
              <input
                type="number"
                name="min"
                value={formData.min}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Quant Min: {formData.quantmin}%</label>
              <input
                type="range"
                name="quantmin"
                value={formData.quantmin}
                min="0"
                max={formData.quantmax}
                onChange={handleInputChange}
                className="slider"
              />
            </div>

            <div className="form-group">
              <label>Quant Max: {formData.quantmax}%</label>
              <input
                type="range"
                name="quantmax"
                value={formData.quantmax}
                min={formData.quantmin}
                max="100"
                onChange={handleInputChange}
                className="slider"
              />
            </div>

            <div className="form-group">
              <label>Tiers: {formData.tier}</label>
              <div className="tier-checkboxes">
                {[1, 2, 3, 4].map(tierNum => (
                  <label key={tierNum} className="tier-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.tier.toString().includes(tierNum.toString())}
                      onChange={(e) => handleTierChange(tierNum, e.target.checked)}
                    />
                    <span className={`tier-label tier-${tierNum}`}>Tier {tierNum}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Lifetime (seconds):</label>
              <input
                type="number"
                name="lifetime"
                value={formData.lifetime}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Restock (seconds):</label>
              <input
                type="number"
                name="restock"
                value={formData.restock}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="form-section">
          <h3>Flags</h3>
          <div className="flags-grid">
            {Object.entries(formData.flags).map(([flagName, flagValue]) => (
              <div key={flagName} className="flag-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={flagValue}
                    onChange={() => handleFlagChange(flagName)}
                  />
                  {flagName}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3>Tags</h3>
          <div className="array-input">
            <select onChange={(e) => handleArrayAdd('tags', e.target.value)}>
              <option value="">Add Tag</option>
              {(availableOptions.tags || []).map(tag => (
                <option key={tag.id} value={tag.name}>{tag.name}</option>
              ))}
            </select>
            <div className="array-items">
              {(formData.tags || []).map(tag => (
                <span key={tag} className="array-item">
                  {tag}
                  <button type="button" onClick={() => handleArrayRemove('tags', tag)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="form-section">
          <h3>Usage</h3>
          <div className="array-input">
            <select onChange={(e) => handleArrayAdd('usage', e.target.value)}>
              <option value="">Add Usage</option>
              {(availableOptions.usage || []).map(usage => (
                <option key={usage.id} value={usage.name}>{usage.name}</option>
              ))}
            </select>
            <div className="array-items">
              {(formData.usage || []).map(usage => (
                <span key={usage} className="array-item">
                  {usage}
                  <button type="button" onClick={() => handleArrayRemove('usage', usage)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ammo Types */}
        <div className="form-section">
          <h3>Ammo Types</h3>
          <div className="array-input">
            <select onChange={(e) => handleArrayAdd('ammo_types', e.target.value)}>
              <option value="">Add Ammo Type</option>
              {(availableOptions.ammoTypes || []).map(ammo => (
                <option key={ammo.id} value={ammo.name}>{ammo.name}</option>
              ))}
            </select>
            <div className="array-items">
              {(formData.ammo_types || []).map(ammo => (
                <span key={ammo} className="array-item">
                  {ammo}
                  <button type="button" onClick={() => handleArrayRemove('ammo_types', ammo)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Magazines */}
        <div className="form-section">
          <h3>Magazines</h3>
          <div className="array-input">
            <select onChange={(e) => handleArrayAdd('magazines', e.target.value)}>
              <option value="">Add Magazine</option>
              {(availableOptions.magazines || []).map(mag => (
                <option key={mag.id} value={mag.name}>{mag.name}</option>
              ))}
            </select>
            <div className="array-items">
              {(formData.magazines || []).map(mag => (
                <span key={mag} className="array-item">
                  {mag}
                  <button type="button" onClick={() => handleArrayRemove('magazines', mag)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="form-section">
          <h3>Attachments</h3>
          {Object.entries(attachments || {}).map(([type, items]) => (
            <div key={type} className="attachment-group">
              <h4>{type}</h4>
              <div className="array-items">
                {(items || []).map(item => (
                  <span key={item} className="array-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="form-section">
          <h3>Variants</h3>
          <div className="variants-list">
            {(variants || []).map(variant => (
              <div key={variant.id} className="variant-item">
                <span className="variant-name">{variant.name}</span>
                <div className="variant-stats">
                  {variant.tier && <span>Tier: {variant.tier}</span>}
                  {variant.price && <span>Price: ${variant.price}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Update Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemDetailsV04;