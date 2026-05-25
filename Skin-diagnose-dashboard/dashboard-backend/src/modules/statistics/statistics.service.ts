import { prisma } from "../../config/prisma";

export const getStatistics = async () => {
  const now = new Date();

  const monthly = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      return prisma.case
        .count({ where: { date: { gte: start, lte: end } } })
        .then((count) => ({ month: start.toLocaleString("default", { month: "short" }), cases: count }));
    })
  );

  const conditionGroups = await prisma.case.groupBy({
    by: ["condition"],
    _count: { condition: true },
    orderBy: { _count: { condition: "desc" } },
  });

  const donut = conditionGroups.map((g) => ({ label: g.condition, value: g._count.condition }));

  const accuracy = await Promise.all(
    conditionGroups.slice(0, 6).map(async (g) => {
      const avg = await prisma.case.aggregate({
        where: { condition: g.condition },
        _avg: { confidence: true },
      });
      return { condition: g.condition, accuracy: Math.round(avg._avg.confidence ?? 0), cases: g._count.condition };
    })
  );

  const patients = await prisma.patient.findMany({
    include: { user: { select: { age: true } } },
  });
  const ageBuckets: Record<string, number> = { "0-18": 0, "19-30": 0, "31-45": 0, "46-60": 0, "61+": 0 };
  for (const p of patients) {
    if (!p.user.age) continue;
    if      (p.user.age <= 18) ageBuckets["0-18"]++;
    else if (p.user.age <= 30) ageBuckets["19-30"]++;
    else if (p.user.age <= 45) ageBuckets["31-45"]++;
    else if (p.user.age <= 60) ageBuckets["46-60"]++;
    else                       ageBuckets["61+"]++;
  }
  const ageDistribution = Object.entries(ageBuckets).map(([group, count]) => ({ group, count }));

  const [totalDoctors, totalPatients, totalCases, totalReports] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.case.count(),
    prisma.report.count(),
  ]);

  return { monthly, donut, accuracy, ageDistribution, kpis: { totalDoctors, totalPatients, totalCases, totalReports } };
};
