// pages/Settings/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthService } from '../../services';
import { Btn, FormField, Input, PageHeader } from '../../components/common';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [pwd,     setPwd]     = useState({ current: '', next: '', confirm: '' });
  const [saving,  setSaving]  = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', email: user.email || '' });
  }, [user]);

  const saveProfile = async () => {
    if (!profile.name.trim()) { toast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const updated = await AuthService.updateMe({ name: profile.name, email: profile.email });
      updateUser(updated);
      toast('Profile saved ✓');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!pwd.current)             { toast('Enter your current password', 'error'); return; }
    if (pwd.next.length < 8)      { toast('New password must be at least 8 characters', 'error'); return; }
    if (pwd.next !== pwd.confirm) { toast('Passwords do not match', 'error'); return; }
    setSavingPwd(true);
    try {
      await AuthService.updateMe({ currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: '', next: '', confirm: '' });
      toast('Password updated ✓');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const cardStyle = { background:'#fff', borderRadius:18, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)', overflow:'hidden', marginBottom:16 };
  const headerStyle = { padding:'20px 24px', borderBottom:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', gap:10 };
  const iconStyle = { width:36, height:36, borderRadius:10, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 };

  return (
    <div style={{ animation:'fadeUp 0.4s ease both', maxWidth:600 }}>
      <PageHeader title="Settings" sub="Manage your admin profile"/>

      {/* Profile section */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>👤</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>Profile</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>Update your display name and email</div>
          </div>
        </div>
        <div style={{ padding:24 }}>
          <FormField label="Name">
            <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name"/>
          </FormField>
          <FormField label="Email">
            <Input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="admin@email.com"/>
          </FormField>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
            <Btn onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</Btn>
          </div>
        </div>
      </div>

      {/* Password section */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>🔒</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>Password</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>Change your login password</div>
          </div>
        </div>
        <div style={{ padding:24 }}>
          <FormField label="Current Password">
            <Input type="password" value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} placeholder="Current password"/>
          </FormField>
          <FormField label="New Password">
            <Input type="password" value={pwd.next} onChange={e => setPwd({ ...pwd, next: e.target.value })} placeholder="Min 8 characters"/>
          </FormField>
          <FormField label="Confirm New Password">
            <Input type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Repeat new password"/>
          </FormField>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
            <Btn onClick={savePassword} disabled={savingPwd}>{savingPwd ? 'Updating…' : 'Update Password'}</Btn>
          </div>
        </div>
      </div>

      {/* Role info */}
      <div style={{ fontSize:12, color:'#94a3b8', textAlign:'center' }}>
        Logged in as <span style={{ color:'#2563eb', fontWeight:700 }}>{user?.name}</span> · Role: <span style={{ fontWeight:700 }}>{user?.role}</span>
      </div>
    </div>
  );
}
