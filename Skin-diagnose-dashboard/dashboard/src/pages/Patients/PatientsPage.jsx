// pages/Patients/PatientsPage.jsx
import { useState } from 'react';
import { useCrud } from '../../hooks/useCrud';
import { PatientService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Btn, Badge, Modal, ConfirmModal, FormField, Input, Select, Avatar, SearchBar, PageHeader, StatCard } from '../../components/common';
import { DOCTORS_LIST } from '../../types';
import { THead, EmptyRow, Loader } from '../Doctors/DoctorsPage';

const BLANK = { name:'', email:'', phone:'', age:'', gender:'Female', doctor:'Dr. Sara Ahmed', status:'active' };

export default function PatientsPage() {
  const toast = useToast();
  const { items: patients, loading, create, update, remove } = useCrud(PatientService);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(BLANK);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(BLANK); setModal({ type:'add' }); };
  const openEdit = (p)  => { setForm({ name:p.name, email:p.email, phone:p.phone, age:p.age, gender:p.gender, doctor:p.doctor, status:p.status }); setModal({ type:'edit', data:p }); };

  const save = async () => {
    if (!form.name || !form.email) { toast('Please fill required fields', 'error'); return; }
    if (modal.type === 'add') { await create({ ...form, age: parseInt(form.age) || 0 }); toast('Patient added ✓'); }
    else                      { await update(modal.data.id, { ...form, age: parseInt(form.age) || modal.data.age }); toast('Patient updated ✓'); }
    setModal(null);
  };

  if (loading) return <Loader/>;

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <PageHeader title="Patients" sub={`${patients.length} patients registered`} action={<Btn onClick={openAdd}>＋ Add Patient</Btn>}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon="👥" label="Total"    value={patients.length} color="#2563eb" bg="#eff6ff"/>
        <StatCard icon="✅" label="Active"   value={patients.filter(p=>p.status==='active').length}   color="#16a34a" bg="#f0fdf4"/>
        <StatCard icon="💤" label="Inactive" value={patients.filter(p=>p.status==='inactive').length} color="#64748b" bg="#f8fafc"/>
        <StatCard icon="👩" label="Female"   value={patients.filter(p=>p.gender==='Female').length}   color="#ec4899" bg="#fdf4ff"/>
      </div>

      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #f1f5f9' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…"/>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Patient','Age / Gender','Assigned Doctor','Last Visit','Status','Actions']}/>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar text={p.name.split(' ').map(w=>w[0]).join('').slice(0,2)} size={34} colorIndex={p.id+2}/>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'13px 16px', fontSize:13, color:'#475569' }}>{p.age} / {p.gender}</td>
                  <td style={{ padding:'13px 16px', fontSize:13, color:'#475569' }}>{p.doctor}</td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:'#94a3b8' }}>{p.lastVisit}</td>
                  <td style={{ padding:'13px 16px' }}><Badge status={p.status}/></td>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(p)}>✏️ Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setModal({ type:'delete', data:p })}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow cols={6} msg="No patients found"/>}
            </tbody>
          </table>
        </div>
      </div>

      {(modal?.type==='add'||modal?.type==='edit') && (
        <Modal title={modal.type==='add'?'Add New Patient':'Edit Patient'} onClose={() => setModal(null)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Full Name *"><Input value={form.name}  onChange={e=>setForm({...form,name:e.target.value})}  placeholder="Patient name"/></FormField>
            <FormField label="Email *">    <Input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@mail.com" type="email"/></FormField>
            <FormField label="Phone">      <Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+20 100 000 0000"/></FormField>
            <FormField label="Age">        <Input value={form.age}   onChange={e=>setForm({...form,age:e.target.value})}   placeholder="Age" type="number"/></FormField>
            <FormField label="Gender"><Select value={form.gender}    onChange={e=>setForm({...form,gender:e.target.value})}><option>Female</option><option>Male</option></Select></FormField>
          </div>
          <FormField label="Assigned Doctor"><Select value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})}>{DOCTORS_LIST.map(d=><option key={d}>{d}</option>)}</Select></FormField>
          <FormField label="Status"><Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save}>{modal.type==='add'?'Add Patient':'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
      {modal?.type==='delete' && (
        <ConfirmModal title="Delete Patient" message={`Delete ${modal.data.name} permanently?`}
          onConfirm={async () => { await remove(modal.data.id); toast('Patient removed','info'); }}
          onClose={() => setModal(null)}/>
      )}
    </div>
  );
}