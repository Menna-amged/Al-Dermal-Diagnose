const BADGE_MAP = {
  active:    { bg:'#f0fdf4', color:'#16a34a', dot:'#22c55e', label:'Active'     },
  inactive:  { bg:'#f8fafc', color:'#64748b', dot:'#94a3b8', label:'Inactive'   },
  banned:    { bg:'#fef2f2', color:'#dc2626', dot:'#ef4444', label:'Banned'     },
  diagnosed: { bg:'#eff6ff', color:'#2563eb', dot:'#3b82f6', label:'Diagnosed'  },
  pending:   { bg:'#fffbeb', color:'#d97706', dot:'#f59e0b', label:'Pending'    },
  closed:    { bg:'#f0fdf4', color:'#16a34a', dot:'#22c55e', label:'Closed'     },
  published: { bg:'#eff6ff', color:'#2563eb', dot:'#3b82f6', label:'Published'  },
  draft:     { bg:'#f8fafc', color:'#64748b', dot:'#94a3b8', label:'Draft'      },
  high:      { bg:'#fef2f2', color:'#dc2626', dot:'#ef4444', label:'High Risk'  },
  medium:    { bg:'#fffbeb', color:'#d97706', dot:'#f59e0b', label:'Medium'     },
  low:       { bg:'#f0fdf4', color:'#16a34a', dot:'#22c55e', label:'Low Risk'   },
};

export function Badge({ status }) {
  const s = BADGE_MAP[status] || BADGE_MAP.inactive;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:s.bg, color:s.color, fontSize:11, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot }} />
      {s.label}
    </span>
  );
}