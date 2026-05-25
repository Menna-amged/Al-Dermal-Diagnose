// pages/Auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [focused, setFocused] = useState('');
  const [shake,   setShake]   = useState(false);

  useEffect(() => { if (error) { setShake(true); setTimeout(() => setShake(false), 500); } }, [error]);

  const handleSubmit = () => login(email, pass);

  const inp = (name) => ({
    width:'100%', padding:'11px 14px 11px 40px',
    background: focused === name ? '#fff' : '#f8faff',
    border:`1.5px solid ${focused === name ? '#2563eb' : '#e2e8f0'}`,
    borderRadius:11, color:'#0f172a', fontFamily:'inherit', fontSize:14,
    outline:'none', boxSizing:'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    transition:'all 0.2s',
  });

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#eff6ff 0%,#e0f2fe 50%,#f0f9ff 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', top:-80, right:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,#bfdbfe44,transparent)', pointerEvents:'none' }}/>
      <div style={{ position:'fixed', bottom:-60, left:-60, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,#bae6fd44,transparent)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:410, animation:'fadeUp 0.5s ease both' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:64, height:64, background:'linear-gradient(135deg,#2563eb,#0891b2)', borderRadius:18, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:14, boxShadow:'0 8px 28px rgba(37,99,235,0.35)' }}>🔬</div>
          <h1 style={{ fontSize:24, fontWeight:900, color:'#0f172a', margin:'0 0 5px' }}>DermaCam</h1>
          <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Skin Diagnosis Platform</p>
        </div>

        {/* Card */}
        <div style={{ background:'#fff', borderRadius:22, padding:'32px 28px', boxShadow:'0 20px 60px rgba(37,99,235,0.12)', animation: shake ? 'shake 0.45s ease' : 'none' }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:'#0f172a', margin:'0 0 3px' }}>Welcome back</h2>
          <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 22px' }}>Sign in to your account</p>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:9, padding:'9px 13px', fontSize:13, color:'#dc2626', marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
              <span>⚠️</span>{error}
            </div>
          )}

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Email address</label>
            <div style={{ position:'relative' }}>
              <input type="email" value={email} placeholder="admin@dermacam.com" onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inp('email')} />
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color: focused === 'email' ? '#2563eb' : '#94a3b8' }}>📧</span>
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={pass} placeholder="••••••••" onChange={e => setPass(e.target.value)} onFocus={() => setFocused('pw')} onBlur={() => setFocused('')} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ ...inp('pw'), paddingRight:38 }} />
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color: focused === 'pw' ? '#2563eb' : '#94a3b8' }}>🔑</span>
              <button onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#94a3b8', padding:2 }}>{showPw ? '🙈' : '👁'}</button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'12px', background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#2563eb,#0891b2)', border:'none', borderRadius:11, color: loading ? '#94a3b8' : '#fff', fontFamily:'inherit', fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 18px rgba(37,99,235,0.38)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading
              ? <><span style={{ width:15, height:15, border:'2px solid #cbd5e1', borderTopColor:'#64748b', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>Signing in…</>
              : 'Sign In →'}
          </button>

          <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:'#94a3b8', lineHeight:2 }}>
            Demo: <span style={{ color:'#2563eb', fontWeight:700 }}>admin@dermacam.com</span> / <span style={{ color:'#2563eb', fontWeight:700 }}>admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
