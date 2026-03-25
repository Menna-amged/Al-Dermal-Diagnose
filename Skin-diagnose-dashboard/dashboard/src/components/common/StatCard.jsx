import { useState } from 'react';

export function StatCard({ icon, label, value, delta, color='#2563eb', bg='#eff6ff' }) {
  const [hov, setHov] = useState(false);
  const isPos = delta?.startsWith('+');
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:'#fff', borderRadius:16, padding:'20px', border:`1.5px solid ${hov ? color+'55' : '#e8f0fe'}`, boxShadow: hov ? `0 8px 28px ${color}22` : '0 2px 8px rgba(37,99,235,0.06)', transition:'all 0.2s', transform: hov ? 'translateY(-3px)' : 'none', cursor:'default', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ width:42, height:42, borderRadius:11, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{icon}</div>
        {delta && <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background: isPos ? '#dcfce7' : '#fef2f2', color: isPos ? '#16a34a' : '#dc2626' }}>{delta}</span>}
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:800, color:'#0f172a', lineHeight:1 }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div style={{ fontSize:12, color:'#64748b', marginTop:4, fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}