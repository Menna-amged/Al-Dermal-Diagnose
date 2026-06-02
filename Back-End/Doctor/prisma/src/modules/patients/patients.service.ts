import { prisma } from "../../config/prisma";

const getDoctorId = async (userId: string): Promise<string> => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");
  return doctor.id;
};

export const getAssignedPatients = async (userId: string) => {
  const doctorId = await getDoctorId(userId);

  // Get all unique patient IDs who have ever consulted this doctor
  const rows = await prisma.$queryRaw<{ patientId: string }[]>`
    SELECT DISTINCT "patientId" FROM "Consultation" WHERE "doctorId" = ${doctorId}
  `;
  const consultationPatientIds = rows.map((r) => r.patientId);

  // Also include patients directly assigned via assignedDoctorId
  const directPatients = await prisma.patient.findMany({
    where: { assignedDoctorId: doctorId },
    select: { id: true },
  });
  const directIds = directPatients.map((p) => p.id);

  // Merge and deduplicate
  const allPatientIds = [...new Set([...consultationPatientIds, ...directIds])];

  if (allPatientIds.length === 0) return [];

  const patients = await prisma.patient.findMany({
    where: { id: { in: allPatientIds } },
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

  const patientIds = patients.map((p) => p.id);
  const latestCases = await prisma.case.findMany({
    where: { patientId: { in: patientIds } },
    orderBy: { date: "desc" },
    select: { patientId: true, condition: true, confidence: true, date: true },
  });
  const caseByPatient = new Map<string, typeof latestCases[0]>();
  for (const c of latestCases) {
    if (!caseByPatient.has(c.patientId)) caseByPatient.set(c.patientId, c);
  }

  return patients.map((p) => {
    const latestCase = caseByPatient.get(p.id);
    return {
      id: p.userId,
      ...p.user,
      bloodType: p.bloodType,
      lastVisit: p.lastVisit,
      condition:  latestCase?.condition  ?? null,
      confidence: latestCase?.confidence ?? null,
      lastCaseAt: latestCase?.date       ?? null,
    };
  });
};

export const getPatientDetails = async (userId: string, patientUserId: string) => {
  const doctorId = await getDoctorId(userId);

  // Find the patient record
  const patient = await prisma.patient.findUnique({
    where: { userId: patientUserId },
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
  if (!patient) throw new Error("Patient not found");

  // Verify this doctor has access: either assigned or has a consultation
  const hasConsultation = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Consultation"
    WHERE "doctorId" = ${doctorId} AND "patientId" = ${patient.id}
  `;
  const count = Number(hasConsultation[0]?.count ?? 0);
  const isAssigned = patient.assignedDoctorId === doctorId;

  if (!isAssigned && count === 0) throw new Error("Patient not found or not assigned to you");

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
      skinImageUrl: true,
      date: true,
      notes: true,
    },
  });

  // Pull skinImageUrl from the most recent consultation this doctor has with this patient
  const consultationRows = await prisma.$queryRaw<{ id: string; skinImageUrl: string | null }[]>`
    SELECT id, "skinImageUrl" FROM "Consultation"
    WHERE "doctorId" = ${doctorId} AND "patientId" = ${patient.id}
    ORDER BY "createdAt" DESC LIMIT 1
  `;
  const consultationSkinImageUrl = consultationRows[0]?.skinImageUrl ?? null;
  const consultationId = consultationRows[0]?.id ?? null;

  // Merge: use consultation image as fallback when case has no image
  const casesWithImage = cases.map((c) => ({
    ...c,
    skinImageUrl: c.skinImageUrl ?? consultationSkinImageUrl,
  }));

  return {
    id: patient.userId,
    ...patient.user,
    bloodType: patient.bloodType,
    lastVisit: patient.lastVisit,
    consultationSkinImageUrl,
    consultationId,
    cases: casesWithImage,
  };
};
