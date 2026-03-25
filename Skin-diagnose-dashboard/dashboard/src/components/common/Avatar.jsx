const AVATAR_COLORS = ['#2563eb','#0891b2','#7c3aed','#059669','#d97706','#dc2626'];

export function Avatar({ text, size=36, colorIndex=0 }) {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  return (
    <div style={{ 
      width:size, height:size, borderRadius:'50%', 
      background:`linear-gradient(135deg,${color},${color}99)`, 
      display:'flex', alignItems:'center', justifyContent:'center', 
      color:'#fff', fontWeight:800, fontSize:size*0.35, flexShrink:0 
    }}>
      {text}
    </div>
  );
}