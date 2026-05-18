import { prisma } from "../../config/prisma";

const getDoctorId = async (userId: string): Promise<string> => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");
  return doctor.id;
};

export const getAppointments = async (userId: string, date?: string) => {
  const doctorId = await getDoctorId(userId);
  let dateFilter: any = {};
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    dateFilter = { date: { gte: start, lte: end } };
  }
  return prisma.appointment.findMany({
    where: { doctorId, ...dateFilter },
    orderBy: { date: "asc" },
  });
};

export const createAppointment = async (
  userId: string,
  data: { patientName: string; date: string; time: string; type: string; notes?: string }
) => {
  const doctorId = await getDoctorId(userId);
  return prisma.appointment.create({
    data: {
      doctorId,
      patientName: data.patientName,
      date: new Date(data.date),
      time: data.time,
      type: data.type,
      notes: data.notes,
    },
  });
};

export const updateAppointment = async (
  userId: string,
  appointmentId: string,
  data: { status?: string; notes?: string; time?: string; date?: string }
) => {
  const doctorId = await getDoctorId(userId);
  const appt = await prisma.appointment.findFirst({ where: { id: appointmentId, doctorId } });
  if (!appt) throw new Error("Appointment not found");

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...(data.status ? { status: data.status as any } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.time ? { time: data.time } : {}),
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
  });
};

export const deleteAppointment = async (userId: string, appointmentId: string) => {
  const doctorId = await getDoctorId(userId);
  const appt = await prisma.appointment.findFirst({ where: { id: appointmentId, doctorId } });
  if (!appt) throw new Error("Appointment not found");
  await prisma.appointment.delete({ where: { id: appointmentId } });
  return { message: "Appointment deleted" };
};
