export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}