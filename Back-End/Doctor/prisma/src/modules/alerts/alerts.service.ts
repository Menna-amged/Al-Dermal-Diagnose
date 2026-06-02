import { prisma } from "../../config/prisma";

const getDoctorId = async (userId: string): Promise<string> => {
  const doctor = await prisma.doctor.findUnique({ where: { userId } });
  if (!doctor) throw new Error("Doctor profile not found");
  return doctor.id;
};

export const getAlerts = async (userId: string, unreadOnly?: boolean) => {
  const doctorId = await getDoctorId(userId);
  return prisma.alert.findMany({
    where: { doctorId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
  });
};

export const markAsRead = async (userId: string, alertId: string) => {
  const doctorId = await getDoctorId(userId);
  const alert = await prisma.alert.findFirst({ where: { id: alertId, doctorId } });
  if (!alert) throw new Error("Alert not found");
  return prisma.alert.update({ where: { id: alertId }, data: { isRead: true } });
};

export const markAllAsRead = async (userId: string) => {
  const doctorId = await getDoctorId(userId);
  await prisma.alert.updateMany({ where: { doctorId, isRead: false }, data: { isRead: true } });
  return { message: "All alerts marked as read" };
};

export const deleteAlert = async (userId: string, alertId: string) => {
  const doctorId = await getDoctorId(userId);
  const alert = await prisma.alert.findFirst({ where: { id: alertId, doctorId } });
  if (!alert) throw new Error("Alert not found");
  await prisma.alert.delete({ where: { id: alertId } });
  return { message: "Alert dismissed" };
};

export const createAlert = async (
  userId: string,
  data: { title: string; message: string; type?: string }
) => {
  const doctorId = await getDoctorId(userId);
  return prisma.alert.create({
    data: {
      doctorId,
      title: data.title,
      message: data.message,
      type: (data.type as any) ?? "INFO",
    },
  });
};
