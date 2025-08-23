-- AlterTable
ALTER TABLE `BonDeCommandeCategory` ADD COLUMN `article_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `BonDeCommandeCategory` ADD CONSTRAINT `BonDeCommandeCategory_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
