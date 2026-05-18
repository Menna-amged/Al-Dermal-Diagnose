/*
  Warnings:

  - Added the required column `doctorName` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientName` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorName` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_doctorId_fkey";

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "doctorName" TEXT NOT NULL,
ADD COLUMN     "patientName" TEXT NOT NULL,
ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "doctorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "doctorName" TEXT NOT NULL,
ALTER COLUMN "doctorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
