import { prisma } from "../../config/prisma";

const getDoctorId = async (userId: string): Promise<string> => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");
  return doctor.id;
};

export const getDoctorCases = async (userId: string, status?: string) => {
  const doctorId = await getDoctorId(userId);
  return prisma.case.findMany({
    where: {
      doctorId,
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      caseNumber: true,
      patientName: true,
      condition: true,
      risk: true,
      status: true,
      confidence: true,
      finalDiagnosis: true,
      date: true,
      notes: true,
      patientId: true,
    },
  });
};

export const getCaseById = async (userId: string, caseId: string) => {
  const doctorId = await getDoctorId(userId);
  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, doctorId },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              age: true,
              gender: true,
            },
          },
        },
      },
    },
  });
  if (!caseRecord) throw new Error("Case not found");

  const { patient, ...rest } = caseRecord;
  return {
    ...rest,
    patient: patient
      ? {
          id: patient.userId,
          ...patient.user,
          bloodType: patient.bloodType,
        }
      : null,
  };
};

export const submitFinalDiagnosis = async (
  userId: string,
  caseId: string,
  data: { finalDiagnosis: string; doctorNotes?: string; status?: string }
) => {
  const doctorId = await getDoctorId(userId);
  const caseRecord = await prisma.case.findFirst({ where: { id: caseId, doctorId } });
  if (!caseRecord) throw new Error("Case not found");

  return prisma.case.update({
    where: { id: caseId },
    data: {
      finalDiagnosis: data.finalDiagnosis,
      doctorNotes: data.doctorNotes,
      status: (data.status as any) ?? "DIAGNOSED",
    },
  });
};
