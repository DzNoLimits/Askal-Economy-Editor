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
    category: '', // tools, containers, clothes, etc.
    attachments: {}, // slots de attachments: { "buttstocks": ["item1", "item2"], "optics": ["item3"] }
    variants: {} // variantes da arma: { "M4A1_Black": { cost: 4600, flags: {...}, attachments: {...} } }
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
        category: item.category || '',
        attachments: item.attachments || {},
        variants: item.variants || {}
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

  // Funções para gerenciar attachments
  const handleAddAttachmentSlot = () => {
    const slotName = prompt('Nome do slot de attachment (ex: buttstocks, optics, suppressors):');
    if (slotName && slotName.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: {
          ...prev.attachments,
          [slotName.trim()]: []
        }
      }));
    }
  };

  const handleRemoveAttachmentSlot = (slotName) => {
    setFormData(prev => {
      const newAttachments = { ...prev.attachments };
      delete newAttachments[slotName];
      return {
        ...prev,
        attachments: newAttachments
      };
    });
  };

  const handleAddAttachment = (slotName) => {
    const attachmentName = prompt(`Adicionar attachment ao slot "${slotName}":`);
    if (attachmentName && attachmentName.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: {
          ...prev.attachments,
          [slotName]: [...(prev.attachments[slotName] || []), attachmentName.trim()]
        }
      }));
    }
  };

  const handleRemoveAttachment = (slotName, attachmentIndex) => {
    setFormData(prev => ({
      ...prev,
      attachments: {
        ...prev.attachments,
        [slotName]: prev.attachments[slotName].filter((_, index) => index !== attachmentIndex)
      }
    }));
  };

  // Funções para gerenciar variantes
  const handleAddVariant = () => {
    const variantName = prompt('Nome da variante (ex: M4A1_Black, AK101_Green):');
    if (variantName && variantName.trim()) {
      setFormData(prev => ({
        ...prev,
        variants: {
          ...prev.variants,
          [variantName.trim()]: {
            // Parâmetros modificáveis em variantes
            cost: formData.price,
            tier: formData.tier,
            nominal: formData.nominal,
            min: formData.min,
            flags: { ...formData.flags },
            attachments: {}
          }
        }
      }));
    }
  };

  const handleRemoveVariant = (variantName) => {
    setFormData(prev => {
      const newVariants = { ...prev.variants };
      delete newVariants[variantName];
      return {
        ...prev,
        variants: newVariants
      };
    });
  };

  const handleUpdateVariant = (variantName, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variantName]: {
          ...prev.variants[variantName],
          [field]: value
        }
      }
    }));
  };

  const handleVariantFlagToggle = (variantName, flagName) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variantName]: {
          ...prev.variants[variantName],
          flags: {
            ...prev.variants[variantName].flags,
            [flagName]: !prev.variants[variantName].flags[flagName]
          }
        }
      }
    }));
  };

  const handleVariantTierToggle = (variantName, tierNumber) => {
    setFormData(prev => {
      const currentTiers = prev.variants[variantName].tier || [];
      const newTiers = currentTiers.includes(tierNumber)
        ? currentTiers.filter(t => t !== tierNumber)
        : [...currentTiers, tierNumber].sort((a, b) => a - b);
      
      return {
        ...prev,
        variants: {
          ...prev.variants,
          [variantName]: {
            ...prev.variants[variantName],
            tier: newTiers.length > 0 ? newTiers : [1]
          }
        }
      };
    });
  };

  // Funções para attachments de variantes
  const handleAddVariantAttachmentSlot = (variantName) => {
    const slotName = prompt('Nome do slot de attachment:');
    if (slotName && slotName.trim()) {
      setFormData(prev => ({
        ...prev,
        variants: {
          ...prev.variants,
          [variantName]: {
            ...prev.variants[variantName],
            attachments: {
              ...prev.variants[variantName].attachments,
              [slotName.trim()]: []
            }
          }
        }
      }));
    }
  };

  const handleAddVariantAttachment = (variantName, slotName) => {
    const attachmentName = prompt(`Adicionar attachment ao slot "${slotName}" da variante "${variantName}":`);
    if (attachmentName && attachmentName.trim()) {
      setFormData(prev => ({
        ...prev,
        variants: {
          ...prev.variants,
          [variantName]: {
            ...prev.variants[variantName],
            attachments: {
              ...prev.variants[variantName].attachments,
              [slotName]: [...(prev.variants[variantName].attachments[slotName] || []), attachmentName.trim()]
            }
          }
        }
      }));
    }
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

        {/* Attachments Block */}
        <div className="parameter-block attachments-block">
          <div className="block-header">
            <h3>🔧 Attachments</h3>
            <button
              className="add-slot-btn"
              onClick={handleAddAttachmentSlot}
              title="Adicionar novo slot de attachment"
            >
              + Slot
            </button>
          </div>
          
          <div className="attachments-container">
            {Object.keys(formData.attachments).length === 0 ? (
              <div className="no-attachments">
                <p>Nenhum slot de attachment configurado</p>
                <small>Clique em "+ Slot" para adicionar um novo slot</small>
              </div>
            ) : (
              Object.entries(formData.attachments).map(([slotName, attachments]) => (
                <div key={slotName} className="attachment-slot">
                  <div className="slot-header">
                    <span className="slot-name">{slotName}</span>
                    <div className="slot-actions">
                      <button
                        className="add-attachment-btn"
                        onClick={() => handleAddAttachment(slotName)}
                        title="Adicionar attachment a este slot"
                      >
                        + Item
                      </button>
                      <button
                        className="remove-slot-btn"
                        onClick={() => handleRemoveAttachmentSlot(slotName)}
                        title="Remover este slot"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="attachments-list">
                    {attachments.length === 0 ? (
                      <div className="empty-slot">
                        <small>Slot vazio - clique em "+ Item" para adicionar</small>
                      </div>
                    ) : (
                      attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <span className="attachment-name">{attachment}</span>
                          <button
                            className="remove-attachment-btn"
                            onClick={() => handleRemoveAttachment(slotName, index)}
                            title="Remover este attachment"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Variants Block */}
        <div className="parameter-block variants-block">
          <div className="block-header">
            <h3>🎨 Variantes</h3>
            <button
              className="add-variant-btn"
              onClick={handleAddVariant}
              title="Adicionar nova variante"
            >
              + Variante
            </button>
          </div>
          
          <div className="variants-container">
            {Object.keys(formData.variants).length === 0 ? (
              <div className="no-variants">
                <p>Nenhuma variante configurada</p>
                <small>Clique em "+ Variante" para adicionar uma nova variante</small>
              </div>
            ) : (
              Object.entries(formData.variants).map(([variantName, variant]) => (
                <div key={variantName} className="variant-item">
                  <div className="variant-header">
                    <h4 className="variant-name">{variantName}</h4>
                    <button
                      className="remove-variant-btn"
                      onClick={() => handleRemoveVariant(variantName)}
                      title="Remover esta variante"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="variant-content">
                    {/* Parâmetros modificáveis */}
                    <div className="variant-parameters">
                      <h5>Parâmetros Próprios</h5>
                      <div className="variant-params-grid">
                        <div className="param-group">
                          <label>Cost:</label>
                          <input
                            type="number"
                            value={variant.cost || 0}
                            onChange={(e) => handleUpdateVariant(variantName, 'cost', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="param-group">
                          <label>Nominal:</label>
                          <input
                            type="number"
                            value={variant.nominal || 0}
                            onChange={(e) => handleUpdateVariant(variantName, 'nominal', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="param-group">
                          <label>Min:</label>
                          <input
                            type="number"
                            value={variant.min || 0}
                            onChange={(e) => handleUpdateVariant(variantName, 'min', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Flags específicas da variante */}
                    <div className="variant-flags">
                      <h5>Flags Específicas</h5>
                      <div className="flags-grid">
                        {Object.entries(variant.flags || {}).map(([flagName, flagValue]) => (
                          <div key={flagName} className="flags-checkbox">
                            <input
                              type="checkbox"
                              id={`${variantName}-${flagName}`}
                              checked={flagValue}
                              onChange={() => handleVariantFlagToggle(variantName, flagName)}
                            />
                            <label htmlFor={`${variantName}-${flagName}`}>{flagName}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tiers específicos da variante */}
                    <div className="variant-tiers">
                      <h5>Tiers Específicos</h5>
                      <div className="tier-buttons">
                        {[1, 2, 3, 4, 'Unique'].map(tier => (
                          <button
                            key={tier}
                            className={`tier-btn ${(variant.tier || []).includes(tier) ? 'active' : ''}`}
                            onClick={() => handleVariantTierToggle(variantName, tier)}
                          >
                            Tier {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Attachments específicos da variante */}
                    <div className="variant-attachments">
                      <div className="attachments-header">
                        <h5>Attachments Específicos</h5>
                        <button
                          className="add-variant-slot-btn"
                          onClick={() => handleAddVariantAttachmentSlot(variantName)}
                          title="Adicionar slot de attachment específico"
                        >
                          + Slot
                        </button>
                      </div>
                      
                      <div className="variant-attachments-list">
                        {Object.keys(variant.attachments || {}).length === 0 ? (
                          <div className="no-variant-attachments">
                            <small>Nenhum attachment específico</small>
                          </div>
                        ) : (
                          Object.entries(variant.attachments || {}).map(([slotName, attachments]) => (
                            <div key={slotName} className="variant-attachment-slot">
                              <div className="variant-slot-header">
                                <span className="variant-slot-name">{slotName}</span>
                                <button
                                  className="add-variant-attachment-btn"
                                  onClick={() => handleAddVariantAttachment(variantName, slotName)}
                                  title="Adicionar attachment"
                                >
                                  + Item
                                </button>
                              </div>
                              <div className="variant-attachments-items">
                                {attachments.map((attachment, index) => (
                                  <span key={index} className="variant-attachment-item">
                                    {attachment}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Parâmetros herdados (readonly) */}
                    <div className="variant-inherited">
                      <h5>📋 Herdado da Classe Principal</h5>
                      <div className="inherited-info">
                        <span>Category: {formData.category}</span>
                        <span>Usage: {formData.usage.join(', ')}</span>
                        <span>Tags: {formData.tags.join(', ')}</span>
                        <span>QuantMax: {formData.quantmax}</span>
                        <span>QuantMin: {formData.quantmin}</span>
                        <span>Lifetime: {getLifetimeLabel(formData.lifetime)}</span>
                        <span>Restock: {getRestockLabel(formData.restock)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemDetailsV05;