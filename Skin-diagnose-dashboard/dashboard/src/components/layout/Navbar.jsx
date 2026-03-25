// components/layout/Navbar.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';

const PAGE_TITLES = { dashboard:'Dashboard', doctors:'Doctors', patients:'Patients', cases:'Cases', reports:'Reports', statistics:'Statistics', settings:'Settings' };

export function Navbar({ activePage }) {
  const { user, logout } = useAuth();
  const [confirm, setConfirm] = useState(false);

  const handleLogout = () => {
    if (confirm) logout();
    else { setConfirm(true); setTimeout(() => setConfirm(false), 3000); }
  };

  return (
    <header style={{ height:62, background:'#fff', borderBottom:'1.5px solid #e8f0fe', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 26px', flexShrink:0, boxShadow:'0 2px 8px rgba(37,99,235,0.05)' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:0 }}>{PAGE_TITLES[activePage] || 'Dashboard'}</h1>
        <p style={{ fontSize:11, color:'#94a3b8', margin:0, marginTop:1 }}>
          {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:1, height:24, background:'#e8f0fe' }} />
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <Avatar text={user?.avatar || 'AD'} size={34} />
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{user?.name}</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>{user?.role}</div>
          </div>
        </div>
        {/* Logout */}
        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 15px', background: confirm ? '#fef2f2' : '#fff', border:`1.5px solid ${confirm ? '#fca5a5' : '#e8f0fe'}`, borderRadius:9, color: confirm ? '#dc2626' : '#64748b', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
          onMouseEnter={e => { if (!confirm) { e.currentTarget.style.borderColor='#fca5a5'; e.currentTarget.style.color='#dc2626'; }}}
          onMouseLeave={e => { if (!confirm) { e.currentTarget.style.borderColor='#e8f0fe'; e.currentTarget.style.color='#64748b'; }}}>
          <span>🚪</span>
          <span>{confirm ? 'Confirm?' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
