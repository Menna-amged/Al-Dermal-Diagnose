// components/common/Charts.jsx

export function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.cases), 1);
  const BAR_MAX_H = 80;
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, padding:'0 4px' }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.cases / max) * BAR_MAX_H);
        const isLast = i === data.length - 1;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:10, color: isLast ? '#2563eb' : '#94a3b8', fontWeight:700 }}>{d.cases}</span>
            <div style={{ width:10, borderRadius:'4px 4px 0 0', height:barH, background: isLast ? 'linear-gradient(180deg,#3b82f6,#2563eb)' : 'linear-gradient(180deg,#bfdbfe,#93c5fd)' }} />
            <span style={{ fontSize:10, color:'#94a3b8', fontWeight:500 }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({ data }) {
  const size = 130, r = 48, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const slices = data.map(d => {
    const dash = (d.pct / 100) * circ, gap = circ - dash;
    const s = { ...d, dash, gap, off }; off += dash; return s;
  });
  return (
    <div style={{ display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
      <svg width={size} height={size} style={{ flexShrink:0 }}>
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={18}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.off + circ * 0.25} />
        ))}
        <text x={cx} y={cy-5}  textAnchor="middle" fontSize={18} fontWeight={800} fill="#0f172a">1,284</text>
        <text x={cx} y={cy+13} textAnchor="middle" fontSize={9}  fontWeight={500} fill="#94a3b8">total</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ width:9, height:9, borderRadius:3, background:d.color, flexShrink:0 }} />
            <span style={{ fontSize:11, color:'#475569', flex:1, minWidth:110 }}>{d.label}</span>
            <span style={{ fontSize:11, fontWeight:700, color:'#0f172a' }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
