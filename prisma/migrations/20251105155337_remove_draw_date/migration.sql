/*
  Warnings:

  - You are about to drop the column `drawDate` on the `Group` table. All the data in the column will be lost.
  - Made the column `creatorId` on table `Group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "drawDate",
ALTER COLUMN "creatorId" SET NOT NULL;
