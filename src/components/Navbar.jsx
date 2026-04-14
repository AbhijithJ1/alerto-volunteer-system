import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

const initials = name => name.split(" ").map(n => n[0]).join("").toUpperCase();

function Avatar({ name, size = 28 }) {
  const palette = ["#3b82f6","#a855f7","#ef4444","#22c55e","#f59e0b","#06b6d4"];
  const c = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${c}1a`, border:`1.5px solid ${c}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.33, fontWeight:700, color:c, flexShrink:0, fontFamily:"Outfit" }}>
      {initials(name)}
    </div>
  );
}

function NotifPanel({ open, notifications, dismissNotification, onClose }) {
  if (!open) return null;
  return (
    <div className="asr" style={{ position:"fixed", top:56, right:16, width:320, zIndex:200, background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, overflow:"hidden", boxShadow:"0 16px 48px rgba(0,0,0,.35)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 16px", borderBottom:"1px solid var(--border-color)" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"var(--text-main)" }}>Notifications</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:17 }}>×</button>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notifications.slice(0,8).map((n) => (
          <div key={n.id} style={{ padding:"10px 16px", borderBottom:"1px solid var(--border-color)", display:"flex", gap:10, alignItems:"flex-start" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:n.type==="success"?"#22c55e":n.type==="warning"?"#f59e0b":"#3b82f6", marginTop:5, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:"var(--text-main)", lineHeight:1.4 }}>{n.message}</div>
              <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2 }}>Just now</div>
            </div>
            <button onClick={() => dismissNotification(n.id)} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:13, flexShrink:0, padding:0 }} title="Dismiss">×</button>
          </div>
        ))}
      </div>
      {!notifications.length && <div style={{ padding:"24px", textAlign:"center", fontSize:12, color:"var(--text-muted)" }}>No new notifications</div>}
    </div>
  );
}

const screenLabels = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  volunteers: 'Volunteers',
  analytics: 'Analytics',
  alerts: 'Alerts',
  'task-status': 'Task Status',
};

export default function Navbar() {
  const { user, logout, notifications, dismissNotification, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifPanel, setNotifPanel] = useState(false);

  if (!user) return null;

  const currentScreen = location.pathname.split("/")[1] || 'dashboard';
  const label = screenLabels[currentScreen] || 'Dashboard';

  return (
    <>
      <div className="topbar">
        {/* Left — Page label */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background: user.role==="organizer" ? "#a855f7" : "#3b82f6", animation:"pulse 1.6s infinite" }} />
          <span style={{ fontSize:14, fontWeight:700, color:"var(--text-main)", letterSpacing:"-0.3px" }}>{label}</span>
          <span style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".6px", background:"var(--bg-accent)", padding:"2px 8px", borderRadius:4 }}>
            {user.role}
          </span>
        </div>

        {/* Right — Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} style={{ background:"none", border:"1px solid var(--border-color)", borderRadius:8, padding:"6px 9px", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Notifications */}
          <button onClick={() => setNotifPanel(!notifPanel)} style={{ background:"none", border:"1px solid var(--border-color)", borderRadius:8, padding:"6px 9px", cursor:"pointer", color:"var(--text-muted)", position:"relative", display:"flex", transition:"all .2s" }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {notifications.length > 0 && <span style={{ position:"absolute", top:-4, right:-4, background:"#ef4444", color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"1.5px solid var(--bg-main)" }}>{notifications.length > 9 ? '9+' : notifications.length}</span>}
          </button>

          {/* User Info */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
            <Avatar name={user.name} size={28} />
            <div style={{ lineHeight:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--text-main)" }}>{user.name}</div>
              <div style={{ fontSize:10, color: user.role==="organizer" ? "#c084fc" : "#60a5fa", fontWeight:500 }}>{user.role}</div>
            </div>
          </div>

          <button onClick={() => { logout(); navigate('/'); }} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444", borderRadius:7, padding:"5px 11px", fontSize:11, cursor:"pointer", fontFamily:"Outfit", fontWeight:600 }}>Logout</button>
        </div>
      </div>
      <NotifPanel open={notifPanel} notifications={notifications} dismissNotification={dismissNotification} onClose={() => setNotifPanel(false)} />
    </>
  );
}
