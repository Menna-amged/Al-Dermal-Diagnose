// pages/Doctors/DoctorsPage.jsx
import { useState } from 'react';
import { useCrud } from '../../hooks/useCrud';
import { DoctorService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Btn, Badge, Modal, ConfirmModal, FormField, Input, Select, Avatar, SearchBar, PageHeader, StatCard } from '../../components/common';

const BLANK = { name:'Dr. ', email:'', phone:'', status:'active' };

export default function DoctorsPage() {
  const toast = useToast();
  const { items: doctors, setItems, loading, create, update, remove } = useCrud(DoctorService);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(BLANK);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(BLANK); setModal({ type:'add' }); };
  const openEdit = (doc) => { setForm({ name: doc.name.startsWith('Dr. ') ? doc.name : 'Dr. ' + doc.name, email:doc.email, phone:doc.phone, status:doc.status }); setModal({ type:'edit', data:doc }); };

  const normalizeDrName = (name) => {
    const stripped = name.trim().replace(/^(dr\.?\s*)+/i, '').trim();
    return stripped ? 'Dr. ' + stripped : '';
  };

  const save = async () => {
    const normalizedName = normalizeDrName(form.name);
    if (!normalizedName || !form.email) { toast('Please fill required fields', 'error'); return; }
    try {
      if (modal.type === 'add') {
        await create({ ...form, name: normalizedName });
        toast('Doctor added ✓');
      } else {
        await update(modal.data.id, { ...form, name: normalizedName });
        toast('Doctor updated ✓');
      }
      setModal(null);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = async (id) => { await remove(id); toast('Doctor removed', 'info'); };

  const handleToggleBan = async (doc) => {
    const updated = await DoctorService.toggleBan(doc.id);
    setItems(prev => prev.map(d => d.id === doc.id ? updated : d));
    toast(doc.status === 'banned' ? 'Doctor unbanned ✓' : 'Doctor banned', 'info');
  };

  if (loading) return <Loader/>;

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <PageHeader title="Doctors" sub={`${doctors.length} doctors registered`} action={<Btn onClick={openAdd}>＋ Add Doctor</Btn>}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon="🩺" label="Total"   value={doctors.length} color="#2563eb" bg="#eff6ff"/>
        <StatCard icon="✅" label="Active"  value={doctors.filter(d=>d.status==='active').length}  color="#16a34a" bg="#f0fdf4"/>
        <StatCard icon="🚫" label="Banned"  value={doctors.filter(d=>d.status==='banned').length}  color="#dc2626" bg="#fef2f2"/>
        <StatCard icon="🔬" label="Cases"   value={doctors.reduce((s,d)=>s+d.cases,0)} color="#7c3aed" bg="#f5f3ff"/>
      </div>

      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #f1f5f9' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors…"/>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Doctor','Cases','Joined','Status','Actions']}/>
            <tbody>
              {filtered.map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar text={doc.avatar} size={36} colorIndex={doc.id}/>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{doc.name}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{doc.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'13px 16px', fontSize:13, fontWeight:700, color:'#2563eb' }}>{doc.cases}</td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:'#94a3b8' }}>{doc.joined}</td>
                  <td style={{ padding:'13px 16px' }}><Badge status={doc.status}/></td>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(doc)}>✏️ Edit</Btn>
                      <Btn size="sm" variant={doc.status==='banned'?'success':'warning'} onClick={() => setModal({ type:'ban', data:doc })}>
                        {doc.status==='banned'?'🔓 Unban':'🚫 Ban'}
                      </Btn>
                      <Btn size="sm" variant="danger" onClick={() => setModal({ type:'delete', data:doc })}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow cols={5} msg="No doctors found"/>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit */}
      {(modal?.type==='add'||modal?.type==='edit') && (
        <Modal title={modal.type==='add'?'Add New Doctor':'Edit Doctor'} onClose={() => setModal(null)}>
          <FormField label="Full Name *"><Input value={form.name}      onChange={e=>setForm({...form,name:e.target.value})}      placeholder="Dr. Full Name"/></FormField>
          <FormField label="Email *">    <Input value={form.email}     onChange={e=>setForm({...form,email:e.target.value})}     placeholder="doctor@email.com" type="email"/></FormField>
          <FormField label="Phone">      <Input value={form.phone}     onChange={e=>setForm({...form,phone:e.target.value})}     placeholder="+20 100 000 0000"/></FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save}>{modal.type==='add'?'Add Doctor':'Save Changes'}</Btn>
          </div>
        </Modal>
      )}

      {modal?.type==='delete' && (
        <ConfirmModal title="Delete Doctor" message={`Permanently delete ${modal.data.name}?`}
          onConfirm={() => handleDelete(modal.data.id)} onClose={() => setModal(null)}/>
      )}
      {modal?.type==='ban' && (
        <ConfirmModal
          title={modal.data.status==='banned'?'Unban Doctor':'Ban Doctor'}
          message={modal.data.status==='banned' ? `Restore access for ${modal.data.name}?` : `Ban ${modal.data.name}? They will lose platform access.`}
          onConfirm={() => handleToggleBan(modal.data)}
          onClose={() => setModal(null)}
          variant={modal.data.status==='banned'?'success':'warning'}/>
      )}
    </div>
  );
}

// ─── shared table helpers ─────────────────────────────────────────────────────
export function THead({ cols }) {
  return (
    <thead>
      <tr style={{ borderBottom:'1.5px solid #f1f5f9', background:'#fafbff' }}>
        {cols.map(h => <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', whiteSpace:'nowrap' }}>{h}</th>)}
      </tr>
    </thead>
  );
}
export function EmptyRow({ cols, msg }) {
  return <tr><td colSpan={cols} style={{ textAlign:'center', padding:'40px', color:'#94a3b8', fontSize:14 }}>{msg}</td></tr>;
}
export function Loader() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'40vh', fontSize:24 }}>⏳</div>;
}