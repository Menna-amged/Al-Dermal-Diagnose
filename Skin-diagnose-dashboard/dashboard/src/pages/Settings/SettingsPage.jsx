// pages/Settings/SettingsPage.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Btn, FormField, Input, PageHeader } from '../../components/common';

export default function SettingsPage() {
  const { user }  = useAuth();
  const toast     = useToast();
  const [form, setForm] = useState({ platformName:'DermaCam', email:'admin@dermacam.com' });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    toast('Settings saved ✓');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ animation:'fadeUp 0.4s ease both', maxWidth:600 }}>
      <PageHeader title="Settings" sub="Platform general configuration"/>
      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚙️</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>General</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>Basic platform information</div>
          </div>
        </div>
        <div style={{ padding:24 }}>
          <FormField label="Platform Name">
            <Input value={form.platformName} onChange={e => setForm({ ...form, platformName:e.target.value })} placeholder="Platform name"/>
          </FormField>
          <FormField label="Admin Email">
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} placeholder="admin@email.com"/>
          </FormField>
          <div style={{ paddingTop:16, borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:12, color:'#94a3b8' }}>
              Logged in as <span style={{ color:'#2563eb', fontWeight:700 }}>{user?.name}</span>
            </div>
            <Btn onClick={save} style={{ minWidth:130 }}>
              {saved ? 'Saved ✓' : 'Save Changes'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
