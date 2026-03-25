// pages/Cases/CasesPage.jsx
import { useState } from 'react';
import { useCrud } from '../../hooks/useCrud';
import { CaseService } from '../../services/';
import { useToast } from '../../context/ToastContext';
import { Btn, Badge, Modal, ConfirmModal, FormField, Input, Select, Textarea, SearchBar, PageHeader, StatCard } from '../../components/common';
import { DOCTORS_LIST } from '../../types';
import { THead, EmptyRow, Loader } from '../Doctors/DoctorsPage';

const CONDITIONS = ['Melanoma','Eczema','Psoriasis','Basal Cell Carcinoma','Acne Vulgaris','Seborrheic Keratosis','Dermatitis','Rosacea'];
const BLANK = { patient:'', doctor:'Dr. Sara Ahmed', condition:'', risk:'low', status:'pending', confidence:85, notes:'' };
const FILTERS = ['all','high','medium','low','pending','diagnosed','closed'];

export default function CasesPage() {
  const toast = useToast();
  const { items: cases, loading, create, update, remove } = useCrud(CaseService);
  const [search, setSearch]  = useState('');
  const [filter, setFilter]  = useState('all');
  const [modal,  setModal]   = useState(null);
  const [form,   setForm]    = useState(BLANK);

  const filtered = cases.filter(c => {
    const matchSearch = c.patient.toLowerCase().includes(search.toLowerCase()) || c.condition.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==='all' || c.risk===filter || c.status===filter;
    return matchSearch && matchFilter;
  });

  const openAdd  = () => { setForm(BLANK); setModal({ type:'add' }); };
  const openEdit = (c) => { setForm({ patient:c.patient, doctor:c.doctor, condition:c.condition, risk:c.risk, status:c.status, confidence:c.confidence, notes:c.notes||'' }); setModal({ type:'edit', data:c }); };

  const save = async () => {
    if (!form.patient || !form.condition) { toast('Fill required fields','error'); return; }
    if (modal.type === 'add') { await create(form); toast('Case added ✓'); }
    else                      { await update(modal.data.id, form); toast('Case updated ✓'); }
    setModal(null);
  };

  if (loading) return <Loader/>;

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <PageHeader title="Cases" sub={`${cases.length} total cases`} action={<Btn onClick={openAdd}>＋ New Case</Btn>}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon="🔬" label="Total"     value={cases.length} color="#2563eb" bg="#eff6ff"/>
        <StatCard icon="⚠️" label="High Risk" value={cases.filter(c=>c.risk==='high').length}       color="#dc2626" bg="#fef2f2"/>
        <StatCard icon="⏳" label="Pending"   value={cases.filter(c=>c.status==='pending').length}   color="#f59e0b" bg="#fffbeb"/>
        <StatCard icon="✅" label="Diagnosed" value={cases.filter(c=>c.status==='diagnosed').length} color="#16a34a" bg="#f0fdf4"/>
        <StatCard icon="🔒" label="Closed"    value={cases.filter(c=>c.status==='closed').length}    color="#64748b" bg="#f8fafc"/>
      </div>

      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #f1f5f9', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases, conditions…"/>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'5px 11px', borderRadius:8, border:'1.5px solid', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s', background: filter===f ? '#2563eb' : '#fff', borderColor: filter===f ? '#2563eb' : '#e2e8f0', color: filter===f ? '#fff' : '#64748b' }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['Case ID','Patient','Doctor','Condition','Risk','Status','Confidence','Date','Actions']}/>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'#2563eb' }}>{c.id}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color:'#0f172a' }}>{c.patient}</td>
                  <td style={{ padding:'12px 14px', fontSize:12, color:'#64748b' }}>{c.doctor}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#0f172a' }}>{c.condition}</td>
                  <td style={{ padding:'12px 14px' }}><Badge status={c.risk}/></td>
                  <td style={{ padding:'12px 14px' }}><Badge status={c.status}/></td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:60, height:5, background:'#e2e8f0', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:`${c.confidence}%`, height:'100%', background: c.confidence>90 ? '#22c55e' : '#f59e0b', borderRadius:99 }}/>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{c.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:12, color:'#94a3b8', whiteSpace:'nowrap' }}>{c.date}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:5 }}>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(c)}>✏️</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setModal({ type:'delete', data:c })}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow cols={9} msg="No cases found"/>}
            </tbody>
          </table>
        </div>
      </div>

      {(modal?.type==='add'||modal?.type==='edit') && (
        <Modal title={modal.type==='add'?'New Case':'Edit Case'} onClose={() => setModal(null)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Patient Name *"><Input value={form.patient} onChange={e=>setForm({...form,patient:e.target.value})} placeholder="Patient name"/></FormField>
            <FormField label="Doctor *"><Select value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})}>{DOCTORS_LIST.map(d=><option key={d}>{d}</option>)}</Select></FormField>
            <FormField label="Condition *">
              <Select value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>
                <option value="">Select condition…</option>
                {CONDITIONS.map(c=><option key={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Risk Level"><Select value={form.risk} onChange={e=>setForm({...form,risk:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Select></FormField>
            <FormField label="Status"><Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="pending">Pending</option><option value="diagnosed">Diagnosed</option><option value="closed">Closed</option></Select></FormField>
            <FormField label={`Confidence: ${form.confidence}%`}>
              <input type="range" min={50} max={100} value={form.confidence} onChange={e=>setForm({...form,confidence:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'#2563eb', marginTop:8 }}/>
            </FormField>
          </div>
          <FormField label="Notes"><Textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Clinical notes…"/></FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save}>{modal.type==='add'?'Add Case':'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
      {modal?.type==='delete' && (
        <ConfirmModal title="Delete Case" message={`Delete case ${modal.data.id}? This cannot be undone.`}
          onConfirm={async () => { await remove(modal.data.id); toast('Case deleted','info'); }}
          onClose={() => setModal(null)}/>
      )}
    </div>
  );
}
