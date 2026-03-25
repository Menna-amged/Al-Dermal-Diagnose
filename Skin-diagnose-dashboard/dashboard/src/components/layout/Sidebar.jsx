// components/layout/Sidebar.jsx
import { useState } from 'react';

const NAV = [
  { icon:'⊞',  label:'Dashboard',  id:'dashboard'  },
  { icon:'🩺', label:'Doctors',    id:'doctors'     },
  { icon:'👥', label:'Patients',   id:'patients'    },
  { icon:'🔬', label:'Cases',      id:'cases'       },
  { icon:'📋', label:'Reports',    id:'reports'     },
  { icon:'📊', label:'Statistics', id:'statistics'  },
  { icon:'⚙️', label:'Settings',   id:'settings'    },
];

export function Sidebar({ active, setActive }) {
  return (
    <aside style={{ width:225, background:'#fff', borderRight:'1.5px solid #e8f0fe', display:'flex', flexDirection:'column', padding:'0 10px 20px', flexShrink:0, boxShadow:'2px 0 12px rgba(37,99,235,0.04)' }}>
      {/* Logo */}
      <div style={{ padding:'20px 12px 18px', borderBottom:'1.5px solid #f1f5f9', marginBottom:10, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, background:'linear-gradient(135deg,#2563eb,#0891b2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 3px 10px rgba(37,99,235,0.3)' }}>🔬</div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>DermaCam</div>
          <div style={{ fontSize:10, color:'#94a3b8', fontWeight:500 }}>Skin Diagnosis</div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#cbd5e1', padding:'4px 12px 8px', letterSpacing:1.2, textTransform:'uppercase' }}>Menu</div>
        {NAV.map(item => <NavBtn key={item.id} item={item} isActive={active === item.id} onClick={() => setActive(item.id)} />)}
      </nav>
    </aside>
  );
}

function NavBtn({ item, isActive, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:10, border:'none', background: isActive ? '#eff6ff' : hov ? '#f8faff' : 'transparent', color: isActive ? '#2563eb' : hov ? '#475569' : '#64748b', fontFamily:'inherit', fontSize:13.5, fontWeight: isActive ? 700 : 500, cursor:'pointer', transition:'all 0.15s', textAlign:'left', width:'100%', borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent' }}>
      <span style={{ fontSize:16 }}>{item.icon}</span>
      <span style={{ flex:1 }}>{item.label}</span>
      {isActive && <span style={{ width:6, height:6, borderRadius:'50%', background:'#2563eb' }} />}
    </button>
  );
}
