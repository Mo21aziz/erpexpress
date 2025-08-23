-- AlterTable
ALTER TABLE `BonDeCommande` ADD COLUMN `target_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Update existing records to have target_date = created_at
UPDATE `BonDeCommande` SET `target_date` = `created_at` WHERE `target_date` = CURRENT_TIMESTAMP(3);
