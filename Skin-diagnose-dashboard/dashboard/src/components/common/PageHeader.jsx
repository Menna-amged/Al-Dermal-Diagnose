export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
      <div>
        <h2 style={{ fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>{title}</h2>
        {sub && <p style={{ fontSize:13, color:'#64748b', margin:'3px 0 0', fontWeight:400 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}