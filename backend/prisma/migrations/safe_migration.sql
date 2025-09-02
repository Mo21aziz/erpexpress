-- First add new decimal columns temporarily
ALTER TABLE Article 
ADD COLUMN quantite_a_stocker_new DECIMAL(10,2),
ADD COLUMN quantite_a_demander_new DECIMAL(10,2);

-- Copy data from old columns to new ones with proper conversion
UPDATE Article 
SET 
  quantite_a_stocker_new = CAST(quantite_a_stocker AS DECIMAL(10,2)),
  quantite_a_demander_new = CAST(quantite_a_demander AS DECIMAL(10,2));

-- Drop the old columns
ALTER TABLE Article 
DROP COLUMN quantite_a_stocker,
DROP COLUMN quantite_a_demander;

-- Rename the new columns to the original names
ALTER TABLE Article 
RENAME COLUMN quantite_a_stocker_new TO quantite_a_stocker,
RENAME COLUMN quantite_a_demander_new TO quantite_a_demander;