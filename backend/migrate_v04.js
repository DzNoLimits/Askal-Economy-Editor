const db = require('./database');

// Script de migração para popular o banco com dados do formato JSON v0.4
const migrateV04 = () => {
  console.log('Starting migration to v0.4 format...');

  // 1. Inserir categoria weapons (baseada no JSON exemplo)
  db.run(`INSERT OR REPLACE INTO categories 
    (name, flag_events, flag_market, flag_p2p, flag_secure, flag_store, flag_dispatch, 
     price, priority, lifetime, restock, min, nominal, quantmin, quantmax, tier) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['weapons', 1, 1, 1, 1, 1, 0, 100, 100, 86400, 600, 1, 1, -1, -1, 1],
    function(err) {
      if (err) console.error('Error inserting weapons category:', err);
      else console.log('✓ Weapons category inserted');
    }
  );

  // 2. Inserir tags comuns
  const tags = ['shelves', 'ground', 'Military', 'Police', 'Civilian'];
  tags.forEach(tag => {
    db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tag], function(err) {
      if (err) console.error(`Error inserting tag ${tag}:`, err);
    });
  });

  // 3. Inserir usage types
  const usageTypes = ['Military', 'Police', 'Hunting', 'Industrial', 'Civilian'];
  usageTypes.forEach(usage => {
    db.run(`INSERT OR IGNORE INTO usage_types (name) VALUES (?)`, [usage], function(err) {
      if (err) console.error(`Error inserting usage ${usage}:`, err);
    });
  });

  // 4. Inserir tipos de munição
  const ammoTypes = ['Ammo_556x45', 'Ammo_556x45Tracer', 'Ammo_762x39', 'Ammo_762x39Tracer'];
  ammoTypes.forEach(ammo => {
    db.run(`INSERT OR IGNORE INTO ammo_types (name) VALUES (?)`, [ammo], function(err) {
      if (err) console.error(`Error inserting ammo ${ammo}:`, err);
    });
  });

  // 5. Inserir magazines
  const magazines = ['Mag_STANAG_30Rnd', 'Mag_STANAG_60Rnd', 'Mag_AKM_30Rnd', 'Mag_AKM_Drum75Rnd'];
  magazines.forEach(mag => {
    db.run(`INSERT OR IGNORE INTO magazines (name) VALUES (?)`, [mag], function(err) {
      if (err) console.error(`Error inserting magazine ${mag}:`, err);
    });
  });

  // 6. Inserir tipos de attachment
  const attachmentTypes = [
    'bayonets', 'buttstocks', 'optics', 'suppressors', 'handguards', 'muzzles'
  ];
  attachmentTypes.forEach(type => {
    db.run(`INSERT OR IGNORE INTO attachment_types (name) VALUES (?)`, [type], function(err) {
      if (err) console.error(`Error inserting attachment type ${type}:`, err);
    });
  });

  // 7. Inserir attachments específicos
  setTimeout(() => {
    const attachments = [
      { name: 'M9A1_Bayonet', type: 'bayonets' },
      { name: 'M4_OEBttstck', type: 'buttstocks' },
      { name: 'M4_CQBBttstck', type: 'buttstocks' },
      { name: 'ACOGOptic', type: 'optics' },
      { name: 'M4_Suppressor', type: 'suppressors' }
    ];

    attachments.forEach(att => {
      db.get(`SELECT id FROM attachment_types WHERE name = ?`, [att.type], (err, row) => {
        if (row) {
          db.run(`INSERT OR IGNORE INTO attachments (name, type_id) VALUES (?, ?)`, 
            [att.name, row.id], function(err) {
              if (err) console.error(`Error inserting attachment ${att.name}:`, err);
            });
        }
      });
    });
  }, 500);

  // 8. Inserir item M4A1 (baseado no JSON exemplo)
  setTimeout(() => {
    db.get(`SELECT id FROM categories WHERE name = ?`, ['weapons'], (err, categoryRow) => {
      if (categoryRow) {
        db.run(`INSERT OR REPLACE INTO items 
          (classname, category_id, nominal, min, quantmin, quantmax, tier, price, lifetime, restock,
           flag_events, flag_market, flag_p2p, flag_secure, flag_store, flag_dispatch) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['M4A1', categoryRow.id, 10, 5, -1, -1, 34, 4500, 14400, 1800, 1, 1, 1, 1, 1, 1],
          function(err) {
            if (err) {
              console.error('Error inserting M4A1:', err);
              return;
            }
            
            console.log('✓ M4A1 item inserted');
            const itemId = this.lastID;

            // Inserir relacionamentos do M4A1
            
            // Tags
            const itemTags = ['shelves', 'ground'];
            itemTags.forEach(tagName => {
              db.get(`SELECT id FROM tags WHERE name = ?`, [tagName], (err, tagRow) => {
                if (tagRow) {
                  db.run(`INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)`, 
                    [itemId, tagRow.id]);
                }
              });
            });

            // Usage
            db.get(`SELECT id FROM usage_types WHERE name = ?`, ['Military'], (err, usageRow) => {
              if (usageRow) {
                db.run(`INSERT OR IGNORE INTO item_usage (item_id, usage_id) VALUES (?, ?)`, 
                  [itemId, usageRow.id]);
              }
            });

            // Ammo types
            const itemAmmo = ['Ammo_556x45', 'Ammo_556x45Tracer'];
            itemAmmo.forEach(ammoName => {
              db.get(`SELECT id FROM ammo_types WHERE name = ?`, [ammoName], (err, ammoRow) => {
                if (ammoRow) {
                  db.run(`INSERT OR IGNORE INTO item_ammo_types (item_id, ammo_type_id) VALUES (?, ?)`, 
                    [itemId, ammoRow.id]);
                }
              });
            });

            // Magazines
            const itemMags = ['Mag_STANAG_30Rnd', 'Mag_STANAG_60Rnd'];
            itemMags.forEach(magName => {
              db.get(`SELECT id FROM magazines WHERE name = ?`, [magName], (err, magRow) => {
                if (magRow) {
                  db.run(`INSERT OR IGNORE INTO item_magazines (item_id, magazine_id) VALUES (?, ?)`, 
                    [itemId, magRow.id]);
                }
              });
            });

            // Attachments
            const itemAttachments = ['M9A1_Bayonet', 'M4_OEBttstck', 'M4_CQBBttstck'];
            itemAttachments.forEach(attName => {
              db.get(`SELECT id FROM attachments WHERE name = ?`, [attName], (err, attRow) => {
                if (attRow) {
                  db.run(`INSERT OR IGNORE INTO item_attachments (item_id, attachment_id) VALUES (?, ?)`, 
                    [itemId, attRow.id]);
                }
              });
            });

            // Variantes do M4A1
            const variants = [
              { name: 'M4A1_Black' },
              { name: 'M4A1_Green' }
            ];
            
            variants.forEach(variant => {
              db.run(`INSERT OR IGNORE INTO variants (item_id, name) VALUES (?, ?)`,
                [itemId, variant.name], function(err) {
                  if (err) console.error(`Error inserting variant ${variant.name}:`, err);
                  else console.log(`✓ Variant ${variant.name} inserted`);
                });
            });
          }
        );
      }
    });
  }, 1000);

  console.log('Migration v0.4 completed!');
};

// Executar migração
migrateV04();

module.exports = { migrateV04 };