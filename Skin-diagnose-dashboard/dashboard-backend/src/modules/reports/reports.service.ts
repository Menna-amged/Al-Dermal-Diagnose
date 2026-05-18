import { prisma } from "../../config/prisma";
import { ReportType, ReportStatus } from "@prisma/client";

const formatReportId = (num: number) => `RPT-${String(num).padStart(3, "0")}`;

export const getAllReports = async () => {
  const reports = await prisma.report.findMany({ orderBy: { date: "desc" } });
  return reports.map((r) => ({ ...r, formattedId: formatReportId(r.reportNumber) }));
};

export const createReport = async (data: {
  title: string; type: string; doctor: string;
  casesCount: number; findings?: string; status?: string;
}) => {
  const { doctor, type, status, ...rest } = data;

  const doctorRecord = await prisma.user.findFirst({
    where: { role: "DOCTOR", firstName: doctor.split(" ")[0] },
  });

  return prisma.report.create({
    data: {
      ...rest,
      doctorName: doctor,
      type: type.toUpperCase() as ReportType,
      status: status ? status.toUpperCase() as ReportStatus : ReportStatus.DRAFT,
      ...(doctorRecord ? { doctorId: doctorRecord.id } : {}),
    },
  });
};

export const updateReport = async (id: string, data: {
  title?: string; type?: string; doctor?: string;
  casesCount?: number; findings?: string; status?: string;
}) => {
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) throw new Error("Report not found");

  const { doctor, type, status, ...rest } = data;
  return prisma.report.update({
    where: { id },
    data: {
      ...rest,
      ...(doctor ? { doctorName: doctor } : {}),
      ...(type   ? { type:   type.toUpperCase()   as ReportType   } : {}),
      ...(status ? { status: status.toUpperCase() as ReportStatus } : {}),
    },
  });
};

export const deleteReport = async (id: string) => {
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) throw new Error("Report not found");
  return prisma.report.delete({ where: { id } });
};

export const publishReport = async (id: string) => {
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) throw new Error("Report not found");
  return prisma.report.update({ where: { id }, data: { status: "PUBLISHED" } });
};
