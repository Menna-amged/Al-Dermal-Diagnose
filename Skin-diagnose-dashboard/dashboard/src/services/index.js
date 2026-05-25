import api from '../config/api';

// ─── Normalizers ──────────────────────────────────────────────────────────────
const toDate = (iso) => (iso ? iso.split('T')[0] : '');

const normalizeDoctor = (d) => ({
  ...d,
  status: d.status?.toLowerCase(),
  joined: toDate(d.joinedAt),
  avatar: d.avatar || d.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
});

const normalizePatient = (p) => ({
  ...p,
  status: p.status?.toLowerCase(),
  doctor: p.doctor?.name ?? p.doctor ?? '',
  lastVisit: toDate(p.lastVisit),
});

const normalizeCase = (c) => ({
  ...c,
  displayId: c.formattedId || c.id,
  patient: c.patientName ?? c.patient?.name ?? c.patient,
  doctor:  c.doctorName  ?? c.doctor?.name  ?? c.doctor,
  risk:    c.risk?.toLowerCase(),
  status:  c.status?.toLowerCase(),
  date:    toDate(c.date),
});

const normalizeReport = (r) => ({
  ...r,
  displayId: r.formattedId || r.id,
  doctor: r.doctorName ?? r.doctor?.name ?? r.doctor,
  status: r.status?.toLowerCase(),
  type:   r.type ? r.type.charAt(0) + r.type.slice(1).toLowerCase() : r.type,
  cases:  r.casesCount ?? r.cases,
  date:   toDate(r.date),
});

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const DoctorService = {
  getAll:    async ()         => { const { data } = await api.get('/doctors');          return data.map(normalizeDoctor); },
  create:    async (d)        => { const { data } = await api.post('/doctors', d);      return normalizeDoctor(data); },
  update:    async (id, d)    => { const { data } = await api.put(`/doctors/${id}`, d); return normalizeDoctor(data); },
  remove:    async (id)       => { await api.delete(`/doctors/${id}`); },
  toggleBan:   async (id)       => { const { data } = await api.post(`/doctors/${id}/toggle-ban`); return normalizeDoctor(data); },
  setPassword: async (id, pwd)  => { const { data } = await api.patch(`/doctors/${id}/password`, { password: pwd }); return data; },
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const PatientService = {
  getAll:  async ()         => { const { data } = await api.get('/patients');           return data.map(normalizePatient); },
  create:  async (p)        => { const { data } = await api.post('/patients', p);       return normalizePatient(data); },
  update:  async (id, p)    => { const { data } = await api.put(`/patients/${id}`, p);  return normalizePatient(data); },
  remove:  async (id)       => { await api.delete(`/patients/${id}`); },
};

// ─── Cases ────────────────────────────────────────────────────────────────────
export const CaseService = {
  getAll:  async ()      => { const { data } = await api.get('/cases');              return data.map(normalizeCase); },
  create:  async (c)     => { const { data } = await api.post('/cases', c);          return normalizeCase(data); },
  update:  async (id, c) => { const { data } = await api.put(`/cases/${id}`, c);     return normalizeCase(data); },
  remove:  async (id)    => { await api.delete(`/cases/${id}`); },
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const ReportService = {
  getAll:   async ()      => { const { data } = await api.get('/reports');                    return data.map(normalizeReport); },
  create:   async (r)     => { const { data } = await api.post('/reports', { ...r, casesCount: r.cases }); return normalizeReport(data); },
  update:   async (id, r) => { const { data } = await api.put(`/reports/${id}`, { ...r, casesCount: r.cases }); return normalizeReport(data); },
  remove:   async (id)    => { await api.delete(`/reports/${id}`); },
  publish:  async (id)    => { const { data } = await api.post(`/reports/${id}/publish`); return normalizeReport(data); },
};

// ─── Statistics ───────────────────────────────────────────────────────────────
const DONUT_COLORS = ['#2563eb', '#0891b2', '#16a34a', '#f59e0b', '#7c3aed', '#ec4899', '#f97316'];

export const StatisticsService = {
  get: async () => {
    const { data } = await api.get('/statistics');
    const total = data.donut.reduce((s, d) => s + d.value, 0);
    return {
      monthly:  data.monthly,
      donut:    data.donut.map((d, i) => ({ label: d.label, pct: total > 0 ? Math.round((d.value / total) * 100) : 0, color: DONUT_COLORS[i % DONUT_COLORS.length] })),
      accuracy: data.accuracy.map(a => ({ label: a.condition, acc: a.accuracy, cases: a.cases })),
      age:      (() => { const t = data.ageDistribution.reduce((s, g) => s + g.count, 0); return data.ageDistribution.map(g => ({ group: g.group, pct: t > 0 ? Math.round((g.count / t) * 100) : 0 })); })(),
      kpis:     data.kpis,
    };
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AuthService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('dashboard_token', data.token);
    return data.admin;
  },
  logout: () => {
    localStorage.removeItem('dashboard_token');
  },
  updateMe: async (payload) => {
    const { data } = await api.patch('/auth/me', payload);
    return data;
  },
};
