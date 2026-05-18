import { prisma } from "../../config/prisma";

export const getDashboardStats = async (userId: string) => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");
  const doctorId = doctor.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    pendingCases,
    diagnosedCases,
    todayAppointments,
    recentCases,
  ] = await Promise.all([
    prisma.patient.count({ where: { assignedDoctorId: doctorId } }),
    prisma.case.count({ where: { doctorId, status: "PENDING" } }),
    prisma.case.count({ where: { doctorId, status: "DIAGNOSED" } }),
    prisma.appointment.count({
      where: {
        doctorId,
        date: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.case.findMany({
      where: { doctorId },
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        caseNumber: true,
        patientName: true,
        condition: true,
        risk: true,
        status: true,
        confidence: true,
        date: true,
      },
    }),
  ]);

  return { totalPatients, pendingCases, diagnosedCases, todayAppointments, recentCases };
};
