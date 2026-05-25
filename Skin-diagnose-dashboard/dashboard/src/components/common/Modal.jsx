export function Modal({ title, onClose, children, width=520 }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, animation:'fadeIn 0.2s ease' }}
    >
      <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:width, maxHeight:'90vh', overflowY:'auto', animation:'slideIn 0.25s ease', boxShadow:'0 25px 60px rgba(37,99,235,0.18)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}