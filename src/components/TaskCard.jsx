import { useState } from 'react';
import { useApp } from '../context/AppContext';

const priorityColor = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#22c55e" };
const statusColor = { pending: "#f59e0b", accepted: "#3b82f6", completed: "#22c55e" };

function Spinner({ size = 12 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", border:"2px solid var(--border-color)", borderTopColor:"#3b82f6", animation:"spin .65s linear infinite", display:"inline-block", flexShrink:0 }} />;
}

function Badge({ label, color }) {
  return (
    <span style={{ background:`${color}20`, color, border:`1px solid ${color}40`, borderRadius:100, padding:"2px 9px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TaskCard({ task, role, onAccept, onDecline, onComplete, onDelete, bestMatch = false, delay = 0 }) {
  const { volunteers, user, expressInterest, approveInterest } = useApp();
  const [loading, setLoading] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const acceptedUsers = (task.acceptedBy || []).map(id => volunteers.find(v => v.id === id)).filter(Boolean);
  const interestedUsers = (task.interestedVolunteers || []).map(id => volunteers.find(v => v.id === id)).filter(Boolean);
  const isFullyStaffed = (task.acceptedBy || []).length >= (task.volunteersNeeded || 1);
  
  const p = task.priority || "medium";
  const pc = priorityColor[p] || priorityColor.medium;
  const time = timeAgo(task.createdAt);

  const handleAccept = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 750));
    setLoading(false);
    onAccept(task.id);
  };

  const handleExpressInterest = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 750));
    setLoading(false);
    expressInterest(task.id, user.id);
  };

  const handleDecline = async () => {
    setDeclining(true);
    await new Promise(r => setTimeout(r, 500));
    setDeclining(false);
    onDecline(task.id);
  };

  return (
    <div className="afu" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: hovered ? "var(--bg-accent)" : "var(--bg-card)",
      borderTop:`1px solid ${hovered ? "var(--border-hover)" : "var(--border-color)"}`,
      borderRight:`1px solid ${hovered ? "var(--border-hover)" : "var(--border-color)"}`,
      borderBottom:`1px solid ${hovered ? "var(--border-hover)" : "var(--border-color)"}`,
      borderLeft:`3px solid ${pc}`,
      borderRadius:12, padding:"15px 16px",
      animationDelay:`${delay}s`,
      transform: hovered ? "translateY(-2px)" : "none",
      boxShadow: hovered ? `0 8px 28px rgba(0,0,0,.2)` : "none",
      transition:"all .22s ease"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:9 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, marginRight:10 }}>
          <div style={{ fontWeight:700, fontSize:14, lineHeight:1.3, color:"var(--text-main)" }}>{task.type}</div>
          {bestMatch && (
            <span style={{ background:"linear-gradient(135deg, rgba(245,158,11,.2), rgba(234,179,8,.15))", color:"#f59e0b", border:"1px solid rgba(245,158,11,.3)", borderRadius:100, padding:"2px 8px", fontSize:9, fontWeight:800, whiteSpace:"nowrap", letterSpacing:".3px" }}>⭐ BEST MATCH</span>
          )}
        </div>
        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
          <Badge label={p} color={pc} />
          <Badge label={task.status} color={statusColor[task.status] || "#f59e0b"} />
        </div>
      </div>
      
      <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom: 11 }}>
        <span style={{ fontSize:11.5, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:4 }}>
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {task.location}
        </span>
        <span style={{ fontSize:11.5, color:"var(--text-muted)" }}>🕐 {time}</span>
        {task.requiredSkill && (
          <span style={{ fontSize:10, color:"#818cf8", background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.2)", borderRadius:5, padding:"1px 7px", fontWeight:600 }}>
            🧠 {task.requiredSkill}
          </span>
        )}
        {acceptedUsers.length > 0 && (
          <span style={{ fontSize:11.5, color:"var(--text-main)", fontWeight:600 }}>
            👥 {acceptedUsers.length}/{task.volunteersNeeded || 1}: {acceptedUsers.map(u => u.name.split(' ')[0]).join(', ')}
          </span>
        )}
        {acceptedUsers.length === 0 && (
          <span style={{ fontSize:11.5, color:"var(--text-muted)" }}>
            👥 0/{task.volunteersNeeded || 1}
          </span>
        )}
      </div>

      {role === "volunteer" && (task.status === "pending" || task.status === "accepted") && !(task.acceptedBy?.includes(user.id) || task.interestedVolunteers?.includes(user.id)) && (
        <div style={{ display:"flex", gap:7, marginTop:3 }}>
          {!isFullyStaffed ? (
            <button onClick={handleAccept} disabled={loading} style={{
              background:"rgba(34,197,94,.13)", border:"1px solid rgba(34,197,94,.28)", color:"#22c55e",
              borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:loading?"default":"pointer",
              fontFamily:"Outfit", display:"flex", alignItems:"center", gap:5, transition:"background .2s"
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background="rgba(34,197,94,.26)")}
            onMouseLeave={e => e.currentTarget.style.background="rgba(34,197,94,.13)"}
            >{loading ? <Spinner size={12}/> : "✅"} Accept</button>
          ) : (
            <button onClick={handleExpressInterest} disabled={loading} style={{
              background:"rgba(147,51,234,.13)", border:"1px solid rgba(147,51,234,.28)", color:"#c084fc",
              borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:loading?"default":"pointer",
              fontFamily:"Outfit", display:"flex", alignItems:"center", gap:5, transition:"background .2s"
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background="rgba(147,51,234,.26)")}
            onMouseLeave={e => e.currentTarget.style.background="rgba(147,51,234,.13)"}
            >{loading ? <Spinner size={12}/> : "🙋"} I'm Interested</button>
          )}
          <button onClick={handleDecline} disabled={declining} style={{
            background: declining ? "rgba(239,68,68,.22)" : "rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.22)", color:"#ef4444",
            borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor: declining ? "default" : "pointer",
            fontFamily:"Outfit", display:"flex", alignItems:"center", gap:5, transition:"background .2s", opacity: declining ? 0.8 : 1
          }}
          onMouseEnter={e => !declining && (e.currentTarget.style.background="rgba(239,68,68,.22)")}
          onMouseLeave={e => e.currentTarget.style.background = declining ? "rgba(239,68,68,.22)" : "rgba(239,68,68,.1)"}
          >{declining ? <><Spinner size={12}/> Declining...</> : "❌ Decline"}</button>
        </div>
      )}
      
      {role === "organizer" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:3 }}>
          <div style={{ display:"flex", gap:7 }}>
            {task.status === "accepted" && (
              <button onClick={() => onComplete(task.id)} style={{
                background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.22)", color:"#22c55e",
                borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Outfit"
              }}>Mark Complete ✓</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(task.id)} style={{
                background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.18)", color:"#ef4444",
                borderRadius:8, padding:"6px 15px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Outfit"
              }}>🗑️ Delete</button>
            )}
          </div>
          
          {interestedUsers.length > 0 && (
            <div style={{ marginTop: 6, borderTop: "1px dashed var(--border-color)", paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Interested Volunteers</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {interestedUsers.map(v => (
                  <div key={v.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--bg-accent)", borderRadius: 8, padding: "6px 10px" }}>
                    <span style={{ fontSize: 12, color: "var(--text-main)", fontWeight: 600 }}>{v.name}</span>
                    <button onClick={() => approveInterest(task.id, v.id)} style={{
                      background:"rgba(147,51,234,.13)", border:"1px solid rgba(147,51,234,.28)", color:"#c084fc",
                      borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer",
                      fontFamily:"Outfit"
                    }}>+ Approve</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
