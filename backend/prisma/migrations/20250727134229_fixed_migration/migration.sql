/*
  Warnings:

  - You are about to drop the column `commande_category_id` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the `CommandeCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collisage` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_commande_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommandeCategory` DROP FOREIGN KEY `CommandeCategory_bon_de_commande_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommandeCategory` DROP FOREIGN KEY `CommandeCategory_category_id_fkey`;

-- DropIndex
DROP INDEX `Article_commande_category_id_key` ON `Article`;

-- AlterTable
ALTER TABLE `Article` DROP COLUMN `commande_category_id`,
    ADD COLUMN `category_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `collisage` VARCHAR(191) NOT NULL,
    MODIFY `price` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `refreshToken` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `CommandeCategory`;

-- CreateTable
CREATE TABLE `BonDeCommandeCategory` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `bon_de_commande_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonDeCommandeCategory` ADD CONSTRAINT `BonDeCommandeCategory_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonDeCommandeCategory` ADD CONSTRAINT `BonDeCommandeCategory_bon_de_commande_id_fkey` FOREIGN KEY (`bon_de_commande_id`) REFERENCES `BonDeCommande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
