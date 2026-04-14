import { useState } from 'react';
import { useApp } from '../context/AppContext';

const priorityColor = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#22c55e" };
const priorityBg = { critical: "rgba(239,68,68,0.12)", high: "rgba(245,158,11,0.12)", medium: "rgba(59,130,246,0.12)", low: "rgba(34,197,94,0.12)" };

function Spinner({ size = 15 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", border:"2px solid var(--border-color)", borderTopColor:"#3b82f6", animation:"spin .65s linear infinite", display:"inline-block", flexShrink:0 }} />;
}

export default function HelpNeededForm({ isOpen, onClose }) {
  const { addTask, taskTypes, locations } = useApp();
  const [form, setForm] = useState({ type: taskTypes[0] || "", priority: "critical", location: locations[0] || "", volunteersNeeded: 1 });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    setLoading(false);
    addTask(form);
    onClose();
  };

  const selStyle = {
    width:"100%", background:"var(--bg-card)", border:"1px solid var(--border-color)",
    borderRadius:10, padding:"10px 14px", color:"var(--text-main)", fontSize:13,
    fontFamily:"Outfit", cursor:"pointer", outline:"none", transition:"border-color .2s"
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", animation:"fadeIn .2s" }} onClick={onClose}>
      <div className="aex" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:18, padding:28, width:"min(450px,95vw)", boxShadow:"0 32px 80px rgba(0,0,0,.5)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:"var(--text-main)" }}>🚨 Dispatch Help Request</div>
            <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:3 }}>Alert all available volunteers</div>
          </div>
          <button onClick={onClose} style={{ background:"var(--border-color)", border:"none", color:"var(--text-muted)", width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {[
          { label:"Task Type", key:"type", options: taskTypes },
          { label:"Priority Level", key:"priority", options: ["critical","high","medium","low"] },
          { label:"Location", key:"location", options: locations },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"var(--text-muted)", display:"block", marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px" }}>{f.label}</label>
            <select value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} style={{ ...selStyle, ...(f.key==="priority" ? { color:priorityColor[form.priority] } : {}) }}>
              {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          </div>
        ))}

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:"var(--text-muted)", display:"block", marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px" }}>Volunteers Needed</label>
          <input type="number" min="1" max="100" value={form.volunteersNeeded} onChange={e => setForm({...form, volunteersNeeded: parseInt(e.target.value) || 1})} style={selStyle} />
        </div>

        <div style={{ background:priorityBg[form.priority], border:`1px solid ${priorityColor[form.priority]}30`, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:9, marginBottom:20 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:priorityColor[form.priority], animation:"pulse 1.5s infinite" }} />
          <span style={{ fontSize:12, color:priorityColor[form.priority], fontWeight:600 }}>
            {form.priority.toUpperCase()} — {form.type} at {form.location}
          </span>
        </div>

        <button onClick={submit} disabled={loading} style={{
          width:"100%", background:"linear-gradient(135deg,#1e40af,#7c3aed)", border:"none", color:"#fff",
          borderRadius:11, padding:"13px", fontSize:14, fontWeight:700, cursor:loading?"default":"pointer",
          fontFamily:"Outfit", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          opacity:loading?.8:1, transition:"opacity .2s"
        }}>
          {loading ? <><Spinner size={15}/> Dispatching...</> : "🚀 Dispatch Now"}
        </button>
      </div>
    </div>
  );
}
