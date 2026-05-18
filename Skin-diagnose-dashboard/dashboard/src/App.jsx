import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar }  from './components/layout/Navbar';
import LoginPage   from './pages/Auth/LoginPage';
import { ROUTES, DEFAULT_ROUTE } from './routes';

/* ── DashboardLayout ────────────────────────────────── */
function DashboardLayout() {
  const [activePage, setActivePage] = useState(DEFAULT_ROUTE);
  const route = ROUTES.find(r => r.id === activePage) || ROUTES[0];
  const PageComponent = route.component;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f0f6ff' }}>
      <Sidebar active={activePage} setActive={setActivePage}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Navbar activePage={activePage}/>
        <main style={{ flex:1, overflowY:'auto', padding:'22px 24px' }}>
          <PageComponent/>
        </main>
      </div>
    </div>
  );
}

/* ── AppRouter ─────────────────────────────────────── */
function AppRouter() {
  const { user } = useAuth();
  return user ? <DashboardLayout/> : <LoginPage/>;
}

/* ── App (root) ────────────────────────────────────── */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter/>
      </AuthProvider>
    </ToastProvider>
  );
}
