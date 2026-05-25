import { prisma } from "../../config/prisma";

const getDoctorId = async (userId: string): Promise<string> => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");
  return doctor.id;
};

export const getAssignedPatients = async (userId: string) => {
  const doctorId = await getDoctorId(userId);
  const patients = await prisma.patient.findMany({
    where: { assignedDoctorId: doctorId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          gender: true,
          age: true,
          createdAt: true,
        },
      },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  return patients.map((p) => ({
    id: p.userId,
    ...p.user,
    bloodType: p.bloodType,
    lastVisit: p.lastVisit,
  }));
};

export const getPatientDetails = async (userId: string, patientUserId: string) => {
  const doctorId = await getDoctorId(userId);

  const patient = await prisma.patient.findFirst({
    where: { userId: patientUserId, assignedDoctorId: doctorId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          gender: true,
          age: true,
          location: true,
          createdAt: true,
        },
      },
    },
  });
  if (!patient) throw new Error("Patient not found or not assigned to you");

  const cases = await prisma.case.findMany({
    where: { patientId: patient.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      caseNumber: true,
      condition: true,
      risk: true,
      status: true,
      confidence: true,
      finalDiagnosis: true,
      date: true,
      notes: true,
    },
  });

  return {
    id: patient.userId,
    ...patient.user,
    bloodType: patient.bloodType,
    lastVisit: patient.lastVisit,
    cases,
  };
};
