/*
  Warnings:

  - You are about to drop the column `is_free` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `price_cents` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the `certificates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `certificates` DROP FOREIGN KEY `certificates_subject_id_fkey`;

-- DropForeignKey
ALTER TABLE `certificates` DROP FOREIGN KEY `certificates_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_subject_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_user_id_fkey`;

-- AlterTable
ALTER TABLE `subjects` DROP COLUMN `is_free`,
    DROP COLUMN `is_published`,
    DROP COLUMN `price_cents`;

-- DropTable
DROP TABLE `certificates`;

-- DropTable
DROP TABLE `payments`;
