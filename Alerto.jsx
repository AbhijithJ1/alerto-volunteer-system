import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const INIT_TASKS = [
  { id: 1, type: "Medical Emergency", priority: "critical", location: "East Gate, Sector 2", time: "2 min ago", status: "pending", assignedTo: null },
  { id: 2, type: "Flood Evacuation", priority: "critical", location: "Block C, Riverside", time: "5 min ago", status: "accepted", assignedTo: "Priya K." },
  { id: 3, type: "Supply Distribution", priority: "high", location: "North Camp Warehouse", time: "12 min ago", status: "pending", assignedTo: null },
  { id: 4, type: "Shelter Setup", priority: "high", location: "Shelter Block B", time: "18 min ago", status: "completed", assignedTo: "Rahul M." },
  { id: 5, type: "Food Distribution", priority: "medium", location: "Community Hall", time: "25 min ago", status: "pending", assignedTo: null },
  { id: 6, type: "Water Supply", priority: "low", location: "Zone 7 Point", time: "40 min ago", status: "accepted", assignedTo: "Arjun N." },
];
const VOLUNTEERS = [
  { id: 1, name: "Priya Krishnan", role: "Medical", available: true, tasks: 3 },
  { id: 2, name: "Rahul Menon", role: "Logistics", available: false, tasks: 5 },
  { id: 3, name: "Arjun Nair", role: "Field", available: true, tasks: 2 },
  { id: 4, name: "Sneha Pillai", role: "Coord.", available: true, tasks: 1 },
  { id: 5, name: "Vijay Thomas", role: "Medical", available: false, tasks: 4 },
];
const TASK_TYPES = ["Medical Emergency","Evacuation Support","Supply Distribution","Shelter Setup","Food Distribution","Water Supply","Crowd Control","Translation Support","Communication Setup","Child Care"];
const LOCATIONS = ["East Gate","West Gate","Sector A","Sector B","North Camp","Riverside Block","Community Hall","Shelter Zone","Zone 7","Medical Tent"];

const priorityColor = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#22c55e" };
const priorityBg = { critical: "rgba(239,68,68,0.12)", high: "rgba(245,158,11,0.12)", medium: "rgba(59,130,246,0.12)", low: "rgba(34,197,94,0.12)" };
const statusColor = { pending: "#f59e0b", accepted: "#3b82f6", completed: "#22c55e" };
const initials = name => name.split(" ").map(n => n[0]).join("").toUpperCase();

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',sans-serif;background:#07090f;color:#e8e8f0;min-height:100vh;overflow-x:hidden}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes expandIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes fabPulse{0%,100%{box-shadow:0 4px 24px rgba(124,58,237,.5)}50%{box-shadow:0 4px 36px rgba(124,58,237,.8),0 0 0 10px rgba(124,58,237,.08)}}
.afu{animation:fadeUp .42s ease both}
.afi{animation:fadeIn .32s ease both}
.asr{animation:slideRight .38s ease both}
.aex{animation:expandIn .28s ease both}
.pulse{animation:pulse 1.6s infinite}
input::placeholder{color:#3a3c50}
select option{background:#131720;color:#e8e8f0}
`;

function StyleInject({ css }) {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", border:`2px solid rgba(255,255,255,.12)`, borderTopColor:"#3b82f6", animation:"spin .65s linear infinite", display:"inline-block", flexShrink:0 }} />;
}

function Badge({ label, color }) {
  return (
    <span style={{ background:`${color}20`, color, border:`1px solid ${color}40`, borderRadius:100, padding:"2px 9px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function Avatar({ name, size = 34 }) {
  const palette = ["#3b82f6","#a855f7","#ef4444","#22c55e","#f59e0b","#06b6d4"];
  const c = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${c}1a`, border:`1.5px solid ${c}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.33, fontWeight:700, color:c, flexShrink:0, fontFamily:"Outfit" }}>
      {initials(name)}
    </div>
  );
}

function Switch({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
      <div style={{ width:42, height:23, borderRadius:12, background:on?"#22c55e":"#1a1f2e", border:`1px solid ${on?"#22c55e":"rgba(255,255,255,.1)"}`, position:"relative", transition:"background .3s,border .3s" }}>
        <div style={{ position:"absolute", top:2, left:on?21:2, width:17, height:17, borderRadius:"50%", background:"#fff", transition:"left .22s cubic-bezier(.4,0,.2,1)", boxShadow:"0 1px 4px rgba(0,0,0,.4)" }} />
      </div>
      <span style={{ fontSize:12, color:on?"#22c55e":"#6a6c80", fontWeight:600 }}>{on?"Available":"Busy"}</span>
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:7 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:"#1a1f2e", border:`1px solid rgba(255,255,255,.1)`, borderLeft:`3px solid ${t.color||"#3b82f6"}`, borderRadius:10, padding:"11px 15px", fontSize:12.5, color:"#e8e8f0", boxShadow:"0 8px 28px rgba(0,0,0,.55)", maxWidth:290, animation:"toastIn .28s ease both" }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon, delay = 0 }) {
  return (
    <div className="afu" style={{ background:"#0d1017", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"16px 18px", animationDelay:`${delay}s` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:10, color:"#4a4c5e", textTransform:"uppercase", letterSpacing:".9px", marginBottom:8, fontWeight:500 }}>{label}</div>
          <div style={{ fontFamily:"JetBrains Mono", fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
        </div>
        <div style={{ width:38, height:38, borderRadius:9, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── TASK CARD ───────────────────────────────────────────────────────────────
function TaskCard({ task, role, onAccept, onDecline, onComplete, delay = 0 }) {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pc = priorityColor[task.priority];

  const handleAccept = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 750));
    setLoading(false);
    onAccept(task.id);
  };

  return (
    <div className="afu" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: hovered ? "#111520" : "#0d1017",
      border:`1px solid ${hovered ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)"}`,
      borderLeft:`3px solid ${pc}`,
      borderRadius:12, padding:"15px 16px",
      animationDelay:`${delay}s`,
      transform: hovered ? "translateY(-2px)" : "none",
      boxShadow: hovered ? `0 8px 28px rgba(0,0,0,.45), 0 0 0 1px ${pc}18` : "none",
      transition:"all .22s ease"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:9 }}>
        <div style={{ fontWeight:700, fontSize:14, lineHeight:1.3, flex:1, marginRight:10 }}>{task.type}</div>
        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
          <Badge label={task.priority} color={pc} />
          <Badge label={task.status} color={statusColor[task.status]} />
        </div>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom: (role==="volunteer" && task.status==="pending") || (role==="organizer" && task.status==="accepted") ? 11 : 0 }}>
        <span style={{ fontSize:11.5, color:"#6a6c80", display:"flex", alignItems:"center", gap:4 }}>
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {task.location}
        </span>
        <span style={{ fontSize:11.5, color:"#4a4c5e" }}>🕐 {task.time}</span>
        {task.assignedTo && <span style={{ fontSize:11.5, color:"#4a4c5e" }}>👤 {task.assignedTo}</span>}
      </div>

      {role === "volunteer" && task.status === "pending" && (
        <div style={{ display:"flex", gap:7, marginTop:3 }}>
          <button onClick={handleAccept} disabled={loading} style={{
            background:"rgba(34,197,94,.13)", border:"1px solid rgba(34,197,94,.28)", color:"#22c55e",
            borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:loading?"default":"pointer",
            fontFamily:"Outfit", display:"flex", alignItems:"center", gap:5, transition:"background .2s"
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background="rgba(34,197,94,.26)")}
          onMouseLeave={e => e.currentTarget.style.background="rgba(34,197,94,.13)"}
          >{loading ? <Spinner size={12}/> : "✅"} Accept</button>
          <button onClick={() => onDecline(task.id)} style={{
            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.22)", color:"#ef4444",
            borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:"pointer",
            fontFamily:"Outfit", transition:"background .2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,.22)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,.1)"}
          >❌ Decline</button>
        </div>
      )}
      {role === "organizer" && task.status === "accepted" && (
        <button onClick={() => onComplete(task.id)} style={{
          marginTop:3, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.22)", color:"#22c55e",
          borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Outfit"
        }}>Mark Complete ✓</button>
      )}
    </div>
  );
}

// ─── HELP MODAL ───────────────────────────────────────────────────────────────
function HelpModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ type:"Medical Emergency", priority:"critical", location:"East Gate" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    setLoading(false);
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  const selStyle = {
    width:"100%", background:"#0d1017", border:"1px solid rgba(255,255,255,.1)",
    borderRadius:10, padding:"10px 14px", color:"#e8e8f0", fontSize:13,
    fontFamily:"Outfit", cursor:"pointer", outline:"none"
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", animation:"fadeIn .2s" }} onClick={onClose}>
      <div className="aex" style={{ background:"#131720", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:28, width:"min(450px,95vw)", boxShadow:"0 32px 80px rgba(0,0,0,.7)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>🚨 Dispatch Help Request</div>
            <div style={{ fontSize:11.5, color:"#4a4c5e", marginTop:3 }}>Alert all available volunteers</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"none", color:"#6a6c80", width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {[
          { label:"Task Type", key:"type", options: TASK_TYPES },
          { label:"Priority Level", key:"priority", options: ["critical","high","medium","low"] },
          { label:"Location", key:"location", options: LOCATIONS },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, color:"#6a6c80", display:"block", marginBottom:5, fontWeight:600, textTransform:"uppercase", letterSpacing:".5px" }}>{f.label}</label>
            <select value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} style={{ ...selStyle, ...(f.key==="priority" ? { color:priorityColor[form.priority] } : {}) }}>
              {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          </div>
        ))}

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

// ─── NOTIF PANEL ─────────────────────────────────────────────────────────────
function NotifPanel({ open, notifications, onClose }) {
  if (!open) return null;
  return (
    <div className="asr" style={{ position:"fixed", top:66, right:16, width:296, zIndex:200, background:"#131720", border:"1px solid rgba(255,255,255,.09)", borderRadius:14, overflow:"hidden", boxShadow:"0 16px 48px rgba(0,0,0,.65)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 15px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <span style={{ fontSize:13, fontWeight:700 }}>Notifications</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#4a4c5e", cursor:"pointer", fontSize:17 }}>×</button>
      </div>
      {notifications.slice(0,6).map((n, i) => (
        <div key={i} style={{ padding:"9px 15px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", gap:9, alignItems:"flex-start" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:n.color||"#3b82f6", marginTop:5, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:12, color:"#c8c8d8", lineHeight:1.4 }}>{n.msg}</div>
            <div style={{ fontSize:10, color:"#3a3c50", marginTop:2 }}>{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout, onNav, screen, notifCount, onToggleNotif }) {
  const orgScreens = ["dashboard","tasks","volunteers"];
  const volScreens = ["dashboard","alerts","status"];
  const screens = user.role === "organizer" ? orgScreens : volScreens;

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:56, background:"rgba(7,9,15,.93)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#1e40af,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14 }}>A</div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, letterSpacing:"-0.4px", lineHeight:1 }}><span style={{ color:"#60a5fa" }}>Alert</span>o</div>
          <div style={{ fontSize:9, color:"#3a3c50", letterSpacing:".5px" }}>proddec cec</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:3 }}>
        {screens.map(s => (
          <button key={s} onClick={() => onNav(s)} style={{
            background: screen===s ? "rgba(255,255,255,.08)" : "none", border:"none",
            color: screen===s ? "#e8e8f0" : "#4a4c5e", padding:"5px 13px", borderRadius:8,
            fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize",
            transition:"all .2s", fontFamily:"Outfit"
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <button onClick={onToggleNotif} style={{ background:"none", border:"1px solid rgba(255,255,255,.08)", borderRadius:8, padding:"6px 9px", cursor:"pointer", color:"#6a6c80", position:"relative", display:"flex" }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {notifCount > 0 && <span style={{ position:"absolute", top:-4, right:-4, background:"#ef4444", color:"#fff", borderRadius:"50%", width:14, height:14, fontSize:8, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"1.5px solid #07090f" }}>{notifCount}</span>}
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Avatar name={user.name} size={28} />
          <div style={{ lineHeight:1 }}>
            <div style={{ fontSize:12, fontWeight:600 }}>{user.name}</div>
            <div style={{ fontSize:10, color: user.role==="organizer" ? "#c084fc" : "#60a5fa", fontWeight:500 }}>{user.role}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444", borderRadius:7, padding:"5px 11px", fontSize:11, cursor:"pointer", fontFamily:"Outfit", fontWeight:600 }}>Logout</button>
      </div>
    </nav>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("organizer");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [focused, setFocused] = useState(null);

  const accent = role === "organizer" ? "#7c3aed" : "#3b82f6";

  const handle = async () => {
    if (!email || !pass || (tab==="signup" && !name)) { setErr("Please fill in all fields."); return; }
    setErr(""); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    onLogin({ name: tab==="signup" ? name : (role==="organizer" ? "Alex Morgan" : "Priya Krishnan"), role, email });
  };

  const inp = (key) => ({
    width:"100%", background:"rgba(13,16,23,.9)", border:`1px solid ${focused===key ? accent : "rgba(255,255,255,.09)"}`,
    borderRadius:10, padding:"11px 14px", color:"#e8e8f0", fontSize:13.5,
    fontFamily:"Outfit", outline:"none", transition:"border-color .2s"
  });

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#07090f", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:560, height:560, borderRadius:"50%", background:`radial-gradient(circle,${accent}14,transparent 68%)`, top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none", transition:"background 1s" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }} />

      <div className="afu" style={{ background:"rgba(13,16,23,.88)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,.09)", borderRadius:20, padding:"34px 32px", width:"min(410px,95vw)", zIndex:1, boxShadow:"0 32px 80px rgba(0,0,0,.65)" }}>
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ width:50, height:50, borderRadius:13, margin:"0 auto 11px", background:"linear-gradient(135deg,#1e40af,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, boxShadow:`0 8px 24px ${accent}40` }}>A</div>
          <div style={{ fontWeight:900, fontSize:21, letterSpacing:"-1px" }}><span style={{ color:"#60a5fa" }}>Alert</span>o</div>
          <div style={{ fontSize:11, color:"#3a3c50", marginTop:2 }}>Real-Time Volunteer Dispatch System</div>
        </div>

        <div style={{ display:"flex", background:"#0d1017", borderRadius:10, padding:3, marginBottom:22, gap:3 }}>
          {["login","signup"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, background:tab===t?"rgba(255,255,255,.07)":"none", border:"none", color:tab===t?"#e8e8f0":"#4a4c5e", borderRadius:8, padding:"7px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Outfit", transition:"all .2s" }}>
              {t==="login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:18 }}>
          {[["organizer","🏢","Organizer","#7c3aed"],["volunteer","🙋","Volunteer","#3b82f6"]].map(([r,icon,label,c]) => (
            <button key={r} onClick={() => setRole(r)} style={{ flex:1, background:role===r?`${c}1a`:"rgba(255,255,255,.04)", border:`1px solid ${role===r?`${c}50`:"rgba(255,255,255,.07)"}`, borderRadius:10, padding:"10px 6px", cursor:"pointer", fontFamily:"Outfit", color:role===r?c:"#4a4c5e", fontSize:12, fontWeight:700, transition:"all .25s" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {tab==="signup" && <div style={{ marginBottom:12 }}><input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} style={inp("name")} /></div>}
        <div style={{ marginBottom:12 }}><input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)} style={inp("email")} /></div>
        <div style={{ marginBottom: err ? 12 : 18 }}><input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onFocus={()=>setFocused("pass")} onBlur={()=>setFocused(null)} style={inp("pass")} /></div>
        {err && <div style={{ color:"#ef4444", fontSize:12, marginBottom:12, textAlign:"center" }}>{err}</div>}

        <button onClick={handle} disabled={loading} style={{ width:"100%", background:`linear-gradient(135deg,#1e40af,${accent})`, border:"none", color:"#fff", borderRadius:11, padding:"12px", fontSize:14, fontWeight:700, cursor:loading?"default":"pointer", fontFamily:"Outfit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"opacity .2s,transform .15s", opacity:loading?.8:1 }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform="translateY(-1px)")}
          onMouseLeave={e => e.currentTarget.style.transform=""}>
          {loading ? <><Spinner/> {tab==="signup"?"Creating...":"Signing in..."}</> : (tab==="login"?"Sign In →":"Create Account")}
        </button>
        <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"#3a3c50" }}>Secured by Alerto · proddec cec</div>
      </div>
    </div>
  );
}

// ─── ORGANIZER SCREENS ────────────────────────────────────────────────────────
function OrgDashboard({ tasks, volunteers, screen, onComplete }) {
  const pending = tasks.filter(t=>t.status==="pending").length;
  const accepted = tasks.filter(t=>t.status==="accepted").length;
  const completed = tasks.filter(t=>t.status==="completed").length;
  const online = volunteers.filter(v=>v.available).length;

  if (screen === "dashboard") return (
    <div className="afi">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:11, marginBottom:22 }}>
        <StatCard label="Pending" value={pending} color="#f59e0b" icon="⏳" delay={0}/>
        <StatCard label="In Progress" value={accepted} color="#3b82f6" icon="⚡" delay={.06}/>
        <StatCard label="Completed" value={completed} color="#22c55e" icon="✅" delay={.12}/>
        <StatCard label="Online" value={online} color="#a855f7" icon="👥" delay={.18}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:14 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:13, color:"#8b8da0" }}>RECENT TASKS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {tasks.slice(0,5).map((t,i) => <TaskCard key={t.id} task={t} role="organizer" onAccept={()=>{}} onDecline={()=>{}} onComplete={onComplete} delay={i*.06}/>)}
          </div>
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:13, color:"#8b8da0" }}>VOLUNTEERS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {volunteers.map((v,i) => (
              <div key={v.id} className="asr" style={{ background:"#0d1017", border:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"11px 13px", display:"flex", alignItems:"center", gap:9, animationDelay:`${i*.05}s` }}>
                <Avatar name={v.name} size={30}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:600 }}>{v.name}</div>
                  <div style={{ fontSize:10.5, color:"#4a4c5e" }}>{v.role} · {v.tasks} tasks</div>
                </div>
                <div style={{ width:7, height:7, borderRadius:"50%", background:v.available?"#22c55e":"#f59e0b" }}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "tasks") return (
    <div className="afi">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15 }}>All Tasks</div>
        <div style={{ display:"flex", gap:6 }}>
          {["all","pending","accepted","completed"].map(f => (
            <button key={f} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", color:"#6a6c80", borderRadius:7, padding:"5px 11px", fontSize:11, cursor:"pointer", fontFamily:"Outfit", textTransform:"capitalize" }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {tasks.map((t,i) => <TaskCard key={t.id} task={t} role="organizer" onAccept={()=>{}} onDecline={()=>{}} onComplete={onComplete} delay={i*.04}/>)}
      </div>
    </div>
  );

  if (screen === "volunteers") return (
    <div className="afi">
      <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Volunteer Management</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:11 }}>
        {volunteers.map((v,i) => (
          <div key={v.id} className="afu" style={{ background:"#0d1017", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"17px", animationDelay:`${i*.06}s` }}>
            <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:13 }}>
              <Avatar name={v.name} size={40}/>
              <div>
                <div style={{ fontWeight:700, fontSize:13.5 }}>{v.name}</div>
                <div style={{ fontSize:11, color:"#4a4c5e" }}>{v.role}</div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, color:"#6a6c80" }}>
              <span>{v.tasks} assigned</span>
              <Badge label={v.available?"available":"busy"} color={v.available?"#22c55e":"#f59e0b"}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return null;
}

// ─── VOLUNTEER SCREENS ────────────────────────────────────────────────────────
function VolDashboard({ tasks, screen, onAccept, onDecline, available, setAvailable, showToast }) {
  const pending = tasks.filter(t=>t.status==="pending");

  if (screen === "dashboard") return (
    <div className="afi">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:11, marginBottom:20 }}>
        <StatCard label="New Alerts" value={pending.length} color="#ef4444" icon="🚨" delay={0}/>
        <StatCard label="Accepted" value={tasks.filter(t=>t.status==="accepted").length} color="#3b82f6" icon="⚡" delay={.06}/>
        <StatCard label="Completed" value={tasks.filter(t=>t.status==="completed").length} color="#22c55e" icon="✅" delay={.12}/>
      </div>
      <div style={{ background:"#0d1017", border:"1px solid rgba(255,255,255,.07)", borderRadius:11, padding:"14px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>My Availability</div>
          <div style={{ fontSize:11.5, color:"#4a4c5e" }}>Toggle to accept or pause new task alerts</div>
        </div>
        <Switch on={available} onChange={v => { setAvailable(v); showToast(v?"🟢 You're now available":"🟡 Set to busy", v?"#22c55e":"#f59e0b"); }}/>
      </div>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:13, color:"#8b8da0" }}>🚨 LIVE ALERTS</div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {pending.slice(0,4).map((t,i) => <TaskCard key={t.id} task={t} role="volunteer" onAccept={onAccept} onDecline={onDecline} delay={i*.08}/>)}
        {!pending.length && <div style={{ textAlign:"center", color:"#3a3c50", fontSize:13, padding:"32px 0" }}>No pending alerts ✓</div>}
      </div>
    </div>
  );

  if (screen === "alerts") return (
    <div className="afi">
      <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>All Task Alerts</div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {pending.map((t,i) => <TaskCard key={t.id} task={t} role="volunteer" onAccept={onAccept} onDecline={onDecline} delay={i*.06}/>)}
        {!pending.length && <div style={{ textAlign:"center", color:"#3a3c50", fontSize:13, padding:"32px 0" }}>No active alerts right now ✓</div>}
      </div>
    </div>
  );

  if (screen === "status") return (
    <div className="afi">
      <div style={{ fontWeight:700, fontSize:15, marginBottom:18 }}>Task Status Tracker</div>
      {["pending","accepted","completed"].map(status => {
        const group = tasks.filter(t=>t.status===status);
        return (
          <div key={status} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:11 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:statusColor[status] }}/>
              <span style={{ fontSize:13, fontWeight:700, textTransform:"capitalize", color:statusColor[status] }}>{status}</span>
              <span style={{ fontSize:11, color:"#3a3c50" }}>({group.length})</span>
            </div>
            {group.length ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {group.map((t,i) => <TaskCard key={t.id} task={t} role="volunteer" onAccept={onAccept} onDecline={onDecline} delay={i*.05}/>)}
              </div>
            ) : <div style={{ fontSize:12, color:"#3a3c50", padding:"8px 0 0 14px" }}>None</div>}
          </div>
        );
      })}
    </div>
  );
  return null;
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [volunteers] = useState(VOLUNTEERS);
  const [toasts, setToasts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState([
    { msg:"🚨 Critical alert — East Gate Medical Emergency", color:"#ef4444", time:"30s ago" },
    { msg:"✅ Priya accepted Supply Distribution task", color:"#22c55e", time:"3m ago" },
    { msg:"🔔 New volunteer joined: Arjun N.", color:"#3b82f6", time:"6m ago" },
    { msg:"📍 Rahul arrived at Shelter Block B", color:"#f59e0b", time:"9m ago" },
  ]);
  const [available, setAvailable] = useState(true);
  const tidRef = useRef(0);

  const showToast = (msg, color="#3b82f6") => {
    const id = ++tidRef.current;
    setToasts(p => [...p, { id, msg, color }]);
    setTimeout(() => setToasts(p => p.filter(t=>t.id!==id)), 3000);
  };

  // Simulated live task after 8s
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      const task = { id:Date.now(), type:"Crowd Control — Gate 3", priority:"high", location:"Gate 3, Main Entrance", time:"Just now", status:"pending", assignedTo:null };
      setTasks(p => [task, ...p]);
      showToast("🚨 New alert: Crowd Control at Gate 3", "#f59e0b");
      setNotifications(p => [{ msg:"🚨 New task: Crowd Control — Gate 3", color:"#f59e0b", time:"Just now" }, ...p]);
    }, 8000);
    return () => clearTimeout(t);
  }, [user]);

  const addTask = (form) => {
    const t = { id:Date.now(), type:form.type, priority:form.priority, location:form.location, time:"Just now", status:"pending", assignedTo:null };
    setTasks(p => [t,...p]);
    const msg = `🚨 ${form.priority.toUpperCase()}: ${form.type} — ${form.location}`;
    showToast(msg, priorityColor[form.priority]);
    setNotifications(p => [{ msg, color:priorityColor[form.priority], time:"Just now" },...p]);
  };

  const handleAccept = (id) => {
    setTasks(p => p.map(t => t.id===id ? {...t, status:"accepted", assignedTo:user.name} : t));
    showToast("✅ Task accepted — coordinator notified!", "#22c55e");
  };
  const handleDecline = (id) => {
    showToast("Task declined.", "#ef4444");
  };
  const handleComplete = (id) => {
    setTasks(p => p.map(t => t.id===id ? {...t, status:"completed"} : t));
    showToast("✅ Task marked complete!", "#22c55e");
  };

  if (!user) return (
    <>
      <StyleInject css={GLOBAL_CSS}/>
      <LoginPage onLogin={u => { setUser(u); setScreen("dashboard"); }}/>
    </>
  );

  const notifCount = Math.min(notifications.length, 4);

  return (
    <>
      <StyleInject css={GLOBAL_CSS}/>
      <Navbar user={user} onLogout={() => setUser(null)} onNav={setScreen} screen={screen} notifCount={notifCount} onToggleNotif={() => setNotifPanel(p=>!p)}/>
      <NotifPanel open={notifPanel} notifications={notifications} onClose={() => setNotifPanel(false)}/>

      <div style={{ paddingTop:56, minHeight:"100vh", background:"#07090f" }}>
        {/* Sub-bar */}
        <div style={{ borderBottom:"1px solid rgba(255,255,255,.05)", padding:"7px 18px", display:"flex", alignItems:"center", gap:9, background:"#07090f" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:user.role==="organizer"?"#a855f7":"#3b82f6", animation:"pulse 1.6s infinite" }}/>
          <span style={{ fontSize:10.5, color:"#3a3c50", letterSpacing:".6px", textTransform:"uppercase" }}>
            {user.role==="organizer" ? "Organizer — Full dispatch & volunteer management access" : "Volunteer — Task alerts & status tracking"}
          </span>
          {user.role === "volunteer" && <div style={{ marginLeft:"auto" }}><Switch on={available} onChange={v => { setAvailable(v); showToast(v?"🟢 Now available":"🟡 Set to busy", v?"#22c55e":"#f59e0b"); }}/></div>}
        </div>

        <div style={{ maxWidth:1080, margin:"0 auto", padding:"22px 18px" }}>
          {user.role === "organizer"
            ? <OrgDashboard tasks={tasks} volunteers={volunteers} screen={screen} onComplete={handleComplete}/>
            : <VolDashboard tasks={tasks} screen={screen} onAccept={handleAccept} onDecline={handleDecline} available={available} setAvailable={setAvailable} showToast={showToast}/>
          }
        </div>
      </div>

      {user.role === "organizer" && (
        <button onClick={() => setShowModal(true)} style={{ position:"fixed", bottom:24, right:24, zIndex:90, background:"linear-gradient(135deg,#1e40af,#7c3aed)", border:"none", color:"#fff", borderRadius:100, padding:"13px 22px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Outfit", display:"flex", alignItems:"center", gap:7, animation:"fabPulse 2.5s infinite" }}>
          <span style={{ fontSize:17, lineHeight:1 }}>+</span> Help Needed
        </button>
      )}

      <HelpModal open={showModal} onClose={() => setShowModal(false)} onSubmit={addTask}/>
      <Toast toasts={toasts}/>
    </>
  );
}
