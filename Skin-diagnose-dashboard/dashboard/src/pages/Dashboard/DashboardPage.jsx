// pages/Dashboard/DashboardPage.jsx
import { StatCard, Badge } from '../../components/common';
import { BarChart, DonutChart } from '../../components/common/Charts';
import { MOCK_CASES, CHART_MONTHLY, CHART_DONUT } from '../../data/MockData';

export default function DashboardPage() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22, animation:'fadeUp 0.4s ease both' }}>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:16 }}>
        <StatCard icon="🔬" label="Total Cases"      value={1284} delta="+12%" color="#2563eb" bg="#eff6ff"/>
        <StatCard icon="✅" label="Diagnosed Today"  value={24}   delta="+3"   color="#0891b2" bg="#ecfeff"/>
        <StatCard icon="⏳" label="Pending Review"   value={7}    delta="-2"   color="#f59e0b" bg="#fffbeb"/>
        <StatCard icon="⚠️" label="High Risk Cases"  value={18}   delta="+5%"  color="#dc2626" bg="#fef2f2"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <ChartCard title="Monthly Cases" sub="Last 7 months"><BarChart data={CHART_MONTHLY}/></ChartCard>
        <ChartCard title="Diagnosis Distribution" sub="All-time breakdown"><DonutChart data={CHART_DONUT}/></ChartCard>
      </div>

      <div style={{ background:'#fff', borderRadius:18, padding:22, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)' }}>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#0f172a' }}>Recent Cases</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Latest diagnoses</div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1.5px solid #f1f5f9', background:'#fafbff' }}>
                {['Case ID','Patient','Condition','Risk','Confidence','Date'].map(h => (
                  <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CASES.slice(0,5).map((c,i) => (
                <tr key={c.id} style={{ borderBottom: i < 4 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'11px 12px', fontSize:12, fontWeight:700, color:'#2563eb' }}>{c.id}</td>
                  <td style={{ padding:'11px 12px', fontSize:13, fontWeight:600, color:'#0f172a' }}>{c.patient}</td>
                  <td style={{ padding:'11px 12px', fontSize:13, color:'#0f172a' }}>{c.condition}</td>
                  <td style={{ padding:'11px 12px' }}><Badge status={c.risk}/></td>
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:55, height:5, background:'#e2e8f0', borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:`${c.confidence}%`, height:'100%', background: c.confidence > 90 ? '#22c55e' : '#f59e0b', borderRadius:99 }}/>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700 }}>{c.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'11px 12px', fontSize:12, color:'#94a3b8' }}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:18, padding:22, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)' }}>
      <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:3 }}>{title}</div>
      <div style={{ fontSize:11, color:'#94a3b8', marginBottom:16 }}>{sub}</div>
      {children}
    </div>
  );
}
