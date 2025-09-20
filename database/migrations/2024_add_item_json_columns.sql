-- Adiciona colunas JSON ao items, se ainda não existirem

ALTER TABLE items ADD COLUMN tags TEXT;
ALTER TABLE items ADD COLUMN usage TEXT;
ALTER TABLE items ADD COLUMN ammo_types TEXT;
ALTER TABLE items ADD COLUMN magazines TEXT;
ALTER TABLE items ADD COLUMN attachments TEXT;
ALTER TABLE items ADD COLUMN variants TEXT;
