/*
  Warnings:

  - You are about to drop the column `assignedDoctorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPremium` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastVisit` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_assignedDoctorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "assignedDoctorId",
DROP COLUMN "bloodType",
DROP COLUMN "isPremium",
DROP COLUMN "lastVisit";

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialty" TEXT,
    "bio" TEXT,
    "clinicName" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bloodType" TEXT,
    "lastVisit" TIMESTAMP(3),
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "assignedDoctorId" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
