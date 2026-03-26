// context/ToastContext.jsx
import { createContext, useContext, useState } from 'react';
import './Toast.css'; 

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = (msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, msg, type }]);

    // Auto remove after 3s
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3000);
  };

  const STYLES = {
    success: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✅' },
    error:   { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', icon: '❌' },
    info:    { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: 'ℹ️' },
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{
        position:'fixed', bottom:28, right:28,
        display:'flex', flexDirection:'column', gap:8, zIndex:2000
      }}>
        {toasts.map(t => {
          const s = STYLES[t.type] || STYLES.success;
          return (
            <div key={t.id} className="toast" style={{
              padding:'12px 18px', borderRadius:12, fontSize:13, fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'space-between',
              gap:8, boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
              background:s.bg, color:s.color, border:`1px solid ${s.border}`,
              animation:'fadeUp 0.3s ease'
            }}>
              <span>{s.icon} {t.msg}</span>
              <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}
                style={{
                  background:'transparent', border:'none', color:s.color,
                  fontWeight:700, cursor:'pointer'
                }}>✖
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);