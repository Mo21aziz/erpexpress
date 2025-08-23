/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `BonDeCommande` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `BonDeCommande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BonDeCommande` ADD COLUMN `code` VARCHAR(191) NOT NULL DEFAULT 'BC-00';

-- Update existing records with sequential codes
SET @row_number = 0;
UPDATE `BonDeCommande` 
SET `code` = CONCAT('BC-', LPAD((@row_number := @row_number + 1), 2, '0'))
ORDER BY `created_at` ASC;

-- CreateIndex
CREATE UNIQUE INDEX `BonDeCommande_code_key` ON `BonDeCommande`(`code`);
