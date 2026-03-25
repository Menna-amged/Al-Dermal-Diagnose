/**
 * ─────────────────────────────────────────
 * types/index.js  –  DermaCam Data Schemas
 * ─────────────────────────────────────────
 *
 * @typedef {Object} User
 * @property {number}  id
 * @property {string}  email
 * @property {string}  password
 * @property {string}  name
 * @property {'Administrator'|'Dermatologist'|'Skin Analyst'} role
 * @property {string}  avatar   – 2-letter initials
 *
 * @typedef {Object} Doctor
 * @property {number}  id
 * @property {string}  name
 * @property {string}  email
 * @property {string}  phone
 * @property {string}  specialty
 * @property {'active'|'inactive'|'banned'} status
 * @property {number}  cases
 * @property {string}  joined   – ISO date string
 * @property {string}  avatar
 *
 * @typedef {Object} Patient
 * @property {number}  id
 * @property {string}  name
 * @property {string}  email
 * @property {string}  phone
 * @property {number}  age
 * @property {'Male'|'Female'} gender
 * @property {string}  bloodType
 * @property {string}  doctor   – assigned doctor name
 * @property {'active'|'inactive'} status
 * @property {string}  lastVisit
 *
 * @typedef {Object} Case
 * @property {string}  id         – format SK-XXXX
 * @property {string}  patient
 * @property {string}  doctor
 * @property {string}  condition
 * @property {'low'|'medium'|'high'} risk
 * @property {'pending'|'diagnosed'|'closed'} status
 * @property {number}  confidence – 0-100
 * @property {string}  date
 * @property {string}  notes
 *
 * @typedef {Object} Report
 * @property {string}  id         – format RPT-XXX
 * @property {string}  title
 * @property {'Monthly'|'Quarterly'|'Annual'|'Special'} type
 * @property {string}  doctor
 * @property {'draft'|'published'} status
 * @property {string}  date
 * @property {number}  cases
 * @property {string}  findings
 */

export const RISK_LEVELS   = ['low', 'medium', 'high'];
export const CASE_STATUSES = ['pending', 'diagnosed', 'closed'];
export const DOC_STATUSES  = ['active', 'inactive', 'banned'];
export const REPORT_TYPES  = ['Monthly', 'Quarterly', 'Annual', 'Special'];
export const SPECIALTIES   = ['Dermatology','Skin Analysis','Oncology','Pathology','Surgery','General'];
export const BLOOD_TYPES   = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
export const DOCTORS_LIST  = ['Dr. Sara Ahmed','Dr. Omar Khalil','Dr. Nour Hassan','Dr. Mona Samir','Dr. Karim Adel'];
