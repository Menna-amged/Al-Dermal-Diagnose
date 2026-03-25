
export const MOCK_ADMIN = {
  id: 0,
  email: 'admin@dermacam.com',
  password: 'admin',
  name: 'Admin',
  role: 'Administrator',
  avatar: 'AD',
};

export const MOCK_DOCTORS = [
  { id:1, name:'Dr. Sara Ahmed',  email:'sara@dermacam.com',  phone:'+20 100 123 4567',  status:'active',  cases:142, joined:'2022-03-15', avatar:'SA' },
  { id:2, name:'Dr. Omar Khalil', email:'omar@dermacam.com',  phone:'+20 111 234 5678', status:'active',  cases:98,  joined:'2022-07-20', avatar:'OK' },
  { id:3, name:'Dr. Nour Hassan', email:'nour@dermacam.com',  phone:'+20 122 345 6789',    status:'banned',  cases:56,  joined:'2023-01-10', avatar:'NH' },
  { id:4, name:'Dr. Mona Samir',  email:'mona@dermacam.com',  phone:'+20 100 456 7890', status:'active',  cases:203, joined:'2021-11-05', avatar:'MS' },
  { id:5, name:'Dr. Karim Adel',  email:'karim@dermacam.com', phone:'+20 111 567 8901',   status:'active',  cases:77,  joined:'2023-05-22', avatar:'KA' },
];

export const MOCK_PATIENTS = [
  { id:1, name:'Layla Hassan',   email:'layla@mail.com',   phone:'+20 100 111 2222', age:34, gender:'Female', doctor:'Dr. Sara Ahmed',  status:'active',   lastVisit:'2024-03-10' },
  { id:2, name:'Ahmed Youssef',  email:'ahmed@mail.com',   phone:'+20 111 222 3333', age:28, gender:'Male',  doctor:'Dr. Omar Khalil', status:'active',   lastVisit:'2024-03-08' },
  { id:3, name:'Nour El-Din',    email:'noureld@mail.com', phone:'+20 122 333 4444', age:52, gender:'Male',   doctor:'Dr. Mona Samir',  status:'active',   lastVisit:'2024-03-05' },
  { id:4, name:'Mona Samir P',   email:'monas@mail.com',   phone:'+20 100 444 5555', age:41, gender:'Female', doctor:'Dr. Sara Ahmed',  status:'inactive', lastVisit:'2024-02-20' },
  { id:5, name:'Kareem Adel P',  email:'kareema@mail.com', phone:'+20 111 555 6666', age:19, gender:'Male',   doctor:'Dr. Karim Adel',  status:'active',   lastVisit:'2024-03-01' },
  { id:6, name:'Dina Mostafa',   email:'dina@mail.com',    phone:'+20 122 666 7777', age:63, gender:'Female', doctor:'Dr. Nour Hassan', status:'active',   lastVisit:'2024-02-15' },
];

export const MOCK_CASES = [
  { id:'SK-0041', patient:'Layla Hassan',  doctor:'Dr. Sara Ahmed',  condition:'Melanoma (Stage I)',   risk:'high',   status:'diagnosed', confidence:94, date:'2024-03-10', notes:'Requires immediate follow-up' },
  { id:'SK-0040', patient:'Ahmed Youssef', doctor:'Dr. Omar Khalil', condition:'Eczema',               risk:'low',    status:'diagnosed', confidence:88, date:'2024-03-08', notes:'Prescribed topical cream' },
  { id:'SK-0039', patient:'Nour El-Din',   doctor:'Dr. Mona Samir',  condition:'Psoriasis',            risk:'medium', status:'pending',   confidence:91, date:'2024-03-05', notes:'Awaiting biopsy results' },
  { id:'SK-0038', patient:'Mona Samir P',  doctor:'Dr. Sara Ahmed',  condition:'Basal Cell Carcinoma', risk:'high',   status:'diagnosed', confidence:97, date:'2024-02-20', notes:'Surgery scheduled' },
  { id:'SK-0037', patient:'Kareem Adel P', doctor:'Dr. Karim Adel',  condition:'Acne Vulgaris',        risk:'low',    status:'closed',    confidence:85, date:'2024-03-01', notes:'Treatment completed' },
  { id:'SK-0036', patient:'Dina Mostafa',  doctor:'Dr. Nour Hassan', condition:'Seborrheic Keratosis', risk:'medium', status:'pending',   confidence:90, date:'2024-02-15', notes:'Follow-up in 2 weeks' },
];

export const MOCK_REPORTS = [
  { id:'RPT-001', title:'Monthly Overview – March 2024', type:'Monthly',   doctor:'Dr. Sara Ahmed',  status:'published', date:'2024-03-01', cases:48,  findings:'Increase in melanoma cases' },
  { id:'RPT-002', title:'Q1 2024 Summary',               type:'Quarterly', doctor:'Dr. Omar Khalil', status:'draft',     date:'2024-03-15', cases:134, findings:'Overall accuracy improved to 96.2%' },
  { id:'RPT-003', title:'High Risk Cases – Feb 2024',    type:'Special',   doctor:'Dr. Mona Samir',  status:'published', date:'2024-02-28', cases:18,  findings:'5 cases referred to oncology' },
  { id:'RPT-004', title:'Annual Report 2023',            type:'Annual',    doctor:'Admin',            status:'published', date:'2024-01-10', cases:512, findings:'Platform expanded to 5 hospitals' },
];

export const CHART_MONTHLY = [
  { month:'Sep', cases:89  }, { month:'Oct', cases:112 }, { month:'Nov', cases:98  },
  { month:'Dec', cases:76  }, { month:'Jan', cases:134 }, { month:'Feb', cases:118 }, { month:'Mar', cases:142 },
];

export const CHART_DONUT = [
  { label:'Melanoma',         pct:11, color:'#dc2626' },
  { label:'Eczema',           pct:25, color:'#2563eb' },
  { label:'Psoriasis',        pct:20, color:'#7c3aed' },
  { label:'Basal Cell Carc.', pct:15, color:'#f59e0b' },
  { label:'Acne',             pct:18, color:'#0891b2' },
  { label:'Other',            pct:11, color:'#64748b' },
];

export const CHART_ACCURACY = [
  { label:'Melanoma',  acc:97, cases:142 },
  { label:'Eczema',    acc:93, cases:318 },
  { label:'Psoriasis', acc:95, cases:256 },
  { label:'BCC',       acc:98, cases:198 },
  { label:'Acne',      acc:91, cases:230 },
];

export const CHART_AGE = [
  { group:'0-18', pct:8 }, { group:'19-30', pct:21 }, { group:'31-45', pct:34 },
  { group:'46-60', pct:26 }, { group:'60+', pct:11 },
];
