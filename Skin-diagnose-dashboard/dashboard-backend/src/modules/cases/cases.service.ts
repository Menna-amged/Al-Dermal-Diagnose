import { prisma } from "../../config/prisma";
import { RiskLevel, CaseStatus } from "@prisma/client";

const formatCaseId = (num: number) => `SK-${String(num).padStart(4, "0")}`;

export const getAllCases = async () => {
  const cases = await prisma.case.findMany({ orderBy: { date: "desc" } });
  return cases.map((c) => ({ ...c, formattedId: formatCaseId(c.caseNumber) }));
};

export const createCase = async (data: {
  patient: string; doctor: string; condition: string;
  risk: string; confidence: number; notes?: string; status?: string;
}) => {
  const { patient, doctor, risk, status, ...rest } = data;

  const patientUser = await prisma.user.findFirst({ where: { role: "PATIENT", firstName: patient.split(" ")[0] } });
  const patientRecord = patientUser
    ? await prisma.patient.findUnique({ where: { userId: patientUser.id } })
    : null;

  const doctorUser = await prisma.user.findFirst({ where: { role: "DOCTOR", firstName: doctor.split(" ")[0] } });
  const doctorRecord = doctorUser
    ? await prisma.doctor.findUnique({ where: { userId: doctorUser.id } })
    : null;

  return prisma.case.create({
    data: {
      ...rest,
      patientName: patient,
      doctorName: doctor,
      risk: risk.toUpperCase() as RiskLevel,
      status: status ? status.toUpperCase() as CaseStatus : CaseStatus.PENDING,
      ...(patientRecord ? { patientId: patientRecord.id } : {}),
      ...(doctorRecord  ? { doctorId:  doctorRecord.id  } : {}),
    },
  });
};

export const updateCase = async (id: string, data: {
  patient?: string; doctor?: string; condition?: string;
  risk?: string; status?: string; confidence?: number; notes?: string;
}) => {
  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) throw new Error("Case not found");

  const { patient, doctor, risk, status, ...rest } = data;
  return prisma.case.update({
    where: { id },
    data: {
      ...rest,
      ...(patient ? { patientName: patient } : {}),
      ...(doctor  ? { doctorName:  doctor  } : {}),
      ...(risk    ? { risk:   risk.toUpperCase()   as RiskLevel   } : {}),
      ...(status  ? { status: status.toUpperCase() as CaseStatus  } : {}),
    },
  });
};

export const deleteCase = async (id: string) => {
  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) throw new Error("Case not found");
  return prisma.case.delete({ where: { id } });
};
