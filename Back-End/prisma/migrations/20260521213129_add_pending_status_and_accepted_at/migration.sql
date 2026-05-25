-- AlterEnum
ALTER TYPE "ConsultationStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
