// services/index.js
// All data-fetching / mutation logic lives here.
// Swap the mock implementations for real API calls (fetch/axios) without
// touching any component.

import {
  MOCK_DOCTORS, MOCK_PATIENTS, MOCK_CASES, MOCK_REPORTS,
} from '../data/MockData';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ─── internal in-memory stores (replace with API calls) ──────────────────────
let _doctors  = [...MOCK_DOCTORS];
let _patients = [...MOCK_PATIENTS];
let _cases    = [...MOCK_CASES];
let _reports  = [...MOCK_REPORTS];

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const DoctorService = {
  getAll:    async ()        => { await delay(); return [..._doctors]; },
  create:    async (data)    => { await delay(); const d = { ...data, id: Date.now(), cases: 0, joined: new Date().toISOString().split('T')[0], avatar: data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) }; _doctors = [..._doctors, d]; return d; },
  update:    async (id, data)=> { await delay(); _doctors = _doctors.map(d => d.id === id ? { ...d, ...data } : d); return _doctors.find(d => d.id === id); },
  remove:    async (id)      => { await delay(); _doctors = _doctors.filter(d => d.id !== id); },
  toggleBan: async (id)      => { await delay(); _doctors = _doctors.map(d => d.id === id ? { ...d, status: d.status === 'banned' ? 'active' : 'banned' } : d); return _doctors.find(d => d.id === id); },
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const PatientService = {
  getAll:  async ()         => { await delay(); return [..._patients]; },
  create:  async (data)     => { await delay(); const p = { ...data, id: Date.now(), lastVisit: new Date().toISOString().split('T')[0] }; _patients = [..._patients, p]; return p; },
  update:  async (id, data) => { await delay(); _patients = _patients.map(p => p.id === id ? { ...p, ...data } : p); return _patients.find(p => p.id === id); },
  remove:  async (id)       => { await delay(); _patients = _patients.filter(p => p.id !== id); },
};

// ─── Cases ────────────────────────────────────────────────────────────────────
export const CaseService = {
  getAll:  async ()         => { await delay(); return [..._cases]; },
  create:  async (data)     => { await delay(); const id = 'SK-' + String(_cases.length + 42).padStart(4, '0'); const c = { ...data, id, date: new Date().toISOString().split('T')[0] }; _cases = [c, ..._cases]; return c; },
  update:  async (id, data) => { await delay(); _cases = _cases.map(c => c.id === id ? { ...c, ...data } : c); return _cases.find(c => c.id === id); },
  remove:  async (id)       => { await delay(); _cases = _cases.filter(c => c.id !== id); },
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const ReportService = {
  getAll:   async ()         => { await delay(); return [..._reports]; },
  create:   async (data)     => { await delay(); const id = 'RPT-' + String(_reports.length + 5).padStart(3, '0'); const r = { ...data, id, date: new Date().toISOString().split('T')[0] }; _reports = [r, ..._reports]; return r; },
  update:   async (id, data) => { await delay(); _reports = _reports.map(r => r.id === id ? { ...r, ...data } : r); return _reports.find(r => r.id === id); },
  remove:   async (id)       => { await delay(); _reports = _reports.filter(r => r.id !== id); },
  publish:  async (id)       => { await delay(); _reports = _reports.map(r => r.id === id ? { ...r, status: 'published' } : r); return _reports.find(r => r.id === id); },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
import { MOCK_ADMIN } from '../data/MockData';
export const AuthService = {
  login: async (email, password) => {
    await delay(800);
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) return MOCK_ADMIN;
    throw new Error('Invalid email or password.');
  },
};
