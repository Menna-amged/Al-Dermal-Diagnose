// pages/Reports/ReportsPage.jsx
import { useState, useEffect } from 'react';
import { useCrud } from '../../hooks/useCrud';
import { ReportService, DoctorService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Btn, Badge, Modal, ConfirmModal, FormField, Input, Select, Textarea, SearchBar, PageHeader, StatCard } from '../../components/common';
import { REPORT_TYPES } from '../../types';
import { THead, EmptyRow, Loader } from '../Doctors/DoctorsPage';

const BLANK = { title:'', type:'Monthly', doctor:'', status:'draft', cases:'', findings:'' };

export default function ReportsPage() {
  const toast = useToast();
  const { items: reports, setItems, loading, create, update, remove } = useCrud(ReportService);
  const [doctors, setDoctors] = useState([]);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(BLANK);

  useEffect(() => {
    DoctorService.getAll()
      .then(list => setDoctors(list.filter(d => d.status !== 'banned')))
      .catch(() => {});
  }, []);

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(BLANK); setModal({ type:'add' }); };
  const openEdit = (r) => { setForm({ title:r.title, type:r.type, doctor:r.doctor, status:r.status, cases:r.cases, findings:r.findings||'' }); setModal({ type:'edit', data:r }); };

  const save = async () => {
    if (!form.title) { toast('Title is required','error'); return; }
    if (modal.type === 'add') { await create({ ...form, cases: parseInt(form.cases)||0 }); toast('Report created ✓'); }
    else                      { await update(modal.data.id, { ...form, cases: parseInt(form.cases)||modal.data.cases }); toast('Report updated ✓'); }
    setModal(null);
  };

  const handlePublish = async (r) => {
    const updated = await ReportService.publish(r.id);
    setItems(prev => prev.map(x => x.id === r.id ? updated : x));
    toast('Report published ✓');
  };

  if (loading) return <Loader/>;

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      <PageHeader title="Reports" sub={`${reports.length} reports`} action={<Btn onClick={openAdd}>＋ New Report</Btn>}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:24 }}>
        <StatCard icon="📋" label="Total"     value={reports.length} color="#2563eb" bg="#eff6ff"/>
        <StatCard icon="📢" label="Published" value={reports.filter(r=>r.status==='published').length} color="#16a34a" bg="#f0fdf4"/>
        <StatCard icon="📝" label="Drafts"    value={reports.filter(r=>r.status==='draft').length}     color="#64748b" bg="#f8fafc"/>
        <StatCard icon="📆" label="Monthly"   value={reports.filter(r=>r.type==='Monthly').length}     color="#7c3aed" bg="#f5f3ff"/>
      </div>

      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid #f1f5f9' }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"/>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <THead cols={['ID','Title','Type','Author','Cases','Status','Date','Actions']}/>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'13px 14px', fontSize:12, fontWeight:700, color:'#2563eb' }}>{r.displayId || r.id}</td>
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', maxWidth:220 }}>{r.title}</div>
                    {r.findings && <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{r.findings}</div>}
                  </td>
                  <td style={{ padding:'13px 14px' }}><span style={{ padding:'3px 9px', borderRadius:8, background:'#eff6ff', color:'#2563eb', fontSize:11, fontWeight:700 }}>{r.type}</span></td>
                  <td style={{ padding:'13px 14px', fontSize:13, color:'#475569' }}>{r.doctor}</td>
                  <td style={{ padding:'13px 14px', fontSize:13, fontWeight:700, color:'#0f172a' }}>{r.cases}</td>
                  <td style={{ padding:'13px 14px' }}><Badge status={r.status}/></td>
                  <td style={{ padding:'13px 14px', fontSize:12, color:'#94a3b8' }}>{r.date}</td>
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ display:'flex', gap:5 }}>
                      <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}>✏️</Btn>
                      {r.status==='draft' && <Btn size="sm" variant="success" onClick={() => handlePublish(r)}>📢</Btn>}
                      <Btn size="sm" variant="danger" onClick={() => setModal({ type:'delete', data:r })}>🗑</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow cols={8} msg="No reports found"/>}
            </tbody>
          </table>
        </div>
      </div>

      {(modal?.type==='add'||modal?.type==='edit') && (
        <Modal title={modal.type==='add'?'New Report':'Edit Report'} onClose={() => setModal(null)}>
          <FormField label="Report Title *"><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Report title"/></FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Type"><Select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{REPORT_TYPES.map(t=><option key={t}>{t}</option>)}</Select></FormField>
            <FormField label="Author">
              <Select value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})}>
                <option value="">— Select doctor —</option>
                {doctors.map(d=><option key={d.id} value={d.name}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Cases Count"><Input type="number" value={form.cases} onChange={e=>setForm({...form,cases:e.target.value})} placeholder="0"/></FormField>
            <FormField label="Status"><Select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></Select></FormField>
          </div>
          <FormField label="Key Findings"><Textarea value={form.findings} onChange={e=>setForm({...form,findings:e.target.value})} placeholder="Summary of findings…"/></FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save}>{modal.type==='add'?'Create Report':'Save'}</Btn>
          </div>
        </Modal>
      )}
      {modal?.type==='delete' && (
        <ConfirmModal title="Delete Report" message={`Delete "${modal.data.title}"?`}
          onConfirm={async () => { await remove(modal.data.id); toast('Report deleted','info'); }}
          onClose={() => setModal(null)}/>
      )}
    </div>
  );
}
