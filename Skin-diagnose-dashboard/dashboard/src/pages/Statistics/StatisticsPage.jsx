// pages/Statistics/StatisticsPage.jsx
import { BarChart, DonutChart } from '../../components/common/Charts';
import { CHART_MONTHLY, CHART_DONUT, CHART_ACCURACY, CHART_AGE } from '../../data/MockData';

export default function StatisticsPage() {
  const kpis = [
    { label:'Overall AI Accuracy', value:'96.2%', sub:'Across all conditions', color:'#2563eb' },
    { label:'Avg. Diagnosis Time',  value:'1.4s',  sub:'Per image analysis',    color:'#0891b2' },
    { label:'False Positive Rate',  value:'2.1%',  sub:'Industry avg: 5.8%',    color:'#16a34a' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, animation:'fadeUp 0.4s ease both' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {kpis.map((k,i)=>(
          <div key={i} style={{ background:'#fff', borderRadius:16, padding:20, border:'1.5px solid #e8f0fe', boxShadow:'0 2px 8px rgba(37,99,235,0.06)' }}>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:0.8 }}>{k.label}</div>
            <div style={{ fontSize:30, fontWeight:900, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:18 }}>
        <Card title="Monthly Cases" sub="Last 7 months"><BarChart data={CHART_MONTHLY}/></Card>
        <Card title="Diagnosis Distribution" sub="All-time breakdown"><DonutChart data={CHART_DONUT}/></Card>
      </div>

      <Card title="AI Accuracy by Condition" sub="Based on validated diagnoses">
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          {CHART_ACCURACY.map((a,i)=>(
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

      <Card title="Patient Age Groups" sub="Distribution of submitted cases">
        <div style={{ display:'flex', gap:14, alignItems:'flex-end', height:110 }}>
          {CHART_AGE.map((g,i)=>(
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#2563eb' }}>{g.pct}%</span>
              <div style={{ width:'100%', borderRadius:'5px 5px 0 0', height:`${g.pct*2.5}px`, background:'linear-gradient(180deg,#93c5fd,#2563eb)', minHeight:6 }}/>
              <span style={{ fontSize:10, color:'#94a3b8', whiteSpace:'nowrap' }}>{g.group}</span>
            </div>
          ))}
        </div>
      </Card>
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
