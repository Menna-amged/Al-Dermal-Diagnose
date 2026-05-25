// pages/Statistics/StatisticsPage.jsx
import { useState, useEffect } from 'react';
import { BarChart, DonutChart } from '../../components/common/Charts';
import { StatisticsService } from '../../services';
import { Loader } from '../Doctors/DoctorsPage';

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    StatisticsService.get().then(setStats).catch(console.error);
  }, []);

  const kpis = [
    { label:'Total Doctors',   value: stats?.kpis.totalDoctors   ?? '—', color:'#2563eb' },
    { label:'Total Patients',  value: stats?.kpis.totalPatients  ?? '—', color:'#0891b2' },
    { label:'Total Cases',     value: stats?.kpis.totalCases     ?? '—', color:'#16a34a' },
    { label:'Total Reports',   value: stats?.kpis.totalReports   ?? '—', color:'#7c3aed' },
  ];

  if (!stats) return <Loader />;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {kpis.map((k,i)=>(
          <div key={i} style={{ background:'#fff', borderRadius:16, padding:20, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)' }}>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:0.8 }}>{k.label}</div>
            <div style={{ fontSize:30, fontWeight:900, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:18 }}>
        <Card title="Monthly Cases" sub="Last 7 months"><BarChart data={stats.monthly}/></Card>
        <Card title="Diagnosis Distribution" sub="All-time breakdown"><DonutChart data={stats.donut} total={stats.kpis?.totalCases}/></Card>
      </div>

      {stats.accuracy.length > 0 && (
        <Card title="AI Accuracy by Condition" sub="Based on validated diagnoses">
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {stats.accuracy.map((a,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'110px 1fr 50px 65px', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{a.label}</span>
                <div style={{ height:7, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ width:`${a.acc}%`, height:'100%', background:'linear-gradient(90deg,#2563eb,#0891b2)', borderRadius:99 }}/>
                </div>
                <span style={{ fontSize:13, fontWeight:800, color:'#2563eb' }}>{a.acc}%</span>
                <span style={{ fontSize:11, color:'#94a3b8' }}>{a.cases} cases</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stats.age.length > 0 && (
        <Card title="Patient Age Groups" sub="Distribution of submitted cases">
          {(() => {
            const maxPct = Math.max(...stats.age.map(g => g.pct), 1);
            return (
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:120 }}>
                {stats.age.map((g,i)=>(
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'#2563eb' }}>{g.pct}%</span>
                    <div style={{ width:10, borderRadius:'4px 4px 0 0', height:Math.max(4, (g.pct / maxPct) * 80), background:'linear-gradient(180deg,#93c5fd,#2563eb)' }}/>
                    <span style={{ fontSize:10, color:'#94a3b8', whiteSpace:'nowrap' }}>{g.group}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}

function Card({ title, sub, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:18, padding:22, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)' }}>
      <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:3 }}>{title}</div>
      {sub && <div style={{ fontSize:11, color:'#94a3b8', marginBottom:16 }}>{sub}</div>}
      {children}
    </div>
  );
}
