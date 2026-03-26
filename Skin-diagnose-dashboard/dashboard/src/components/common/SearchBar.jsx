import { useState } from 'react';

const inputBase = { width:'100%', padding:'10px 14px', background:'#f8faff', border:'1.5px solid #e2e8f0', borderRadius:10, color:'#0f172a', fontFamily:'inherit', fontSize:13, outline:'none', boxSizing:'border-box', transition:'all 0.2s' };
const focusStyle = { borderColor:'#2563eb', boxShadow:'0 0 0 3px rgba(37,99,235,0.1)', background:'#fff' };

export function SearchBar({ value, onChange, placeholder }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position:'relative', flex:1, maxWidth:300 }}>
      <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#94a3b8' }}>🔍</span>
      <input 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder || 'Search…'} 
        onFocus={() => setF(true)} 
        onBlur={() => setF(false)}
        style={{ ...inputBase, paddingLeft:34, maxWidth:'none', ...(f ? focusStyle : {}) }}
      />
    </div>
  );
}