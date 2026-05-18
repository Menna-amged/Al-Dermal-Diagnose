
import DashboardPage  from '../pages/Dashboard/DashboardPage';
import DoctorsPage    from '../pages/Doctors/DoctorsPage';
import PatientsPage   from '../pages/Patients/PatientsPage';
import CasesPage      from '../pages/Cases/CasesPage';
import ReportsPage    from '../pages/Reports/ReportsPage';
import StatisticsPage from '../pages/Statistics/StatisticsPage';
import SettingsPage   from '../pages/Settings/SettingsPage';

export const ROUTES = [
  { id:'dashboard',  label:'Dashboard',  icon:'⊞',  component: DashboardPage  },
  { id:'doctors',    label:'Doctors',    icon:'🩺', component: DoctorsPage    },
  { id:'patients',   label:'Patients',   icon:'👥', component: PatientsPage   },
  { id:'cases',      label:'Cases',      icon:'🔬', component: CasesPage      },
  { id:'reports',    label:'Reports',    icon:'📋', component: ReportsPage    },
  { id:'statistics', label:'Statistics', icon:'📊', component: StatisticsPage },
  { id:'settings',   label:'Settings',   icon:'⚙️', component: SettingsPage   },
];

export const DEFAULT_ROUTE = 'dashboard';