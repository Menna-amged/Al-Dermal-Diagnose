import { useState } from 'react';

const VARIANTS = {
  primary:   { base:'#2563eb', hover:'#1d4ed8', text:'#fff', shadow:'rgba(37,99,235,0.35)' },
  secondary: { base:'#fff', hover:'#f1f5f9', text:'#475569', shadow:'none', border:'#e2e8f0' },
  danger:    { base:'#dc2626', hover:'#b91c1c', text:'#fff', shadow:'rgba(220,38,38,0.3)' },
  warning:   { base:'#f59e0b', hover:'#d97706', text:'#fff', shadow:'none' },
  success:   { base:'#16a34a', hover:'#15803d', text:'#fff', shadow:'none' },
  ghost:     { base:'transparent', hover:'#f8faff', text:'#2563eb', shadow:'none', border:'#bfdbfe' },
};
const SIZES = {
  sm: { padding:'5px 11px', fontSize:11 },
  md: { padding:'9px 18px', fontSize:13 },
  lg: { padding:'12px 24px', fontSize:14 },
};

export function Btn({ children, onClick, variant='primary', size='md', disabled=false, style={} }) {
  const [hov, setHov] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'inline-flex', alignItems:'center', gap:6,
        border: v.border ? `1.5px solid ${v.border}` : 'none',
        borderRadius:10, fontFamily:'inherit', fontWeight:700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition:'all 0.18s',
        background: hov ? v.hover : v.base,
        color: v.text,
        boxShadow: hov && v.shadow !== 'none' ? `0 6px 18px ${v.shadow}` : 'none',
        ...s, ...style,
      }}
    >
      {children}
    </button>
  );
}