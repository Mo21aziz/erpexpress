-- AlterTable
ALTER TABLE `BonDeCommandeCategory` ADD COLUMN `quantite_a_demander` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `quantite_a_stocker` INTEGER NOT NULL DEFAULT 0;
