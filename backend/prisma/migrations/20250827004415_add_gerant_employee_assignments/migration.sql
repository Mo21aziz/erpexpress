-- AlterTable
ALTER TABLE `Article` ADD COLUMN `numero` INTEGER NULL;

-- CreateTable
CREATE TABLE `GerantEmployeeAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `gerant_id` VARCHAR(191) NOT NULL,
    `employee_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GerantEmployeeAssignment_gerant_id_employee_id_key`(`gerant_id`, `employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GerantEmployeeAssignment` ADD CONSTRAINT `GerantEmployeeAssignment_gerant_id_fkey` FOREIGN KEY (`gerant_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GerantEmployeeAssignment` ADD CONSTRAINT `GerantEmployeeAssignment_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
