/*
  Warnings:

  - The `result` column on the `Generation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Generation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Made the column `model` on table `Generation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parameters` on table `Generation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startTime` on table `Generation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Generation" DROP CONSTRAINT "Generation_userId_fkey";

-- AlterTable
ALTER TABLE "Generation" ALTER COLUMN "model" SET NOT NULL,
ALTER COLUMN "parameters" SET NOT NULL,
ALTER COLUMN "parameters" DROP DEFAULT,
DROP COLUMN "result",
ADD COLUMN     "result" JSONB,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "metadata" DROP DEFAULT,
ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "startTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "Generation_status_idx" ON "Generation"("status");

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
