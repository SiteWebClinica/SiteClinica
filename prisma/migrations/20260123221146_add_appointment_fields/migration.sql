/*
  Warnings:

  - Made the column `startTime` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "color" TEXT DEFAULT 'blue',
ADD COLUMN     "repeat" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "endTime" SET NOT NULL,
ALTER COLUMN "notify" SET DEFAULT 'nao_notificar',
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'consultation';
