-- AlterTable
ALTER TABLE `Article` ADD COLUMN `quantite_a_demander` DECIMAL(10, 2) NULL,
    ADD COLUMN `quantite_a_stocker` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `BonDeCommande` ALTER COLUMN `code` DROP DEFAULT;

-- AlterTable
ALTER TABLE `BonDeCommandeCategory` ADD COLUMN `quantite_a_demander` DECIMAL(10, 2) NULL,
    ADD COLUMN `quantite_a_stocker` DECIMAL(10, 2) NULL;
