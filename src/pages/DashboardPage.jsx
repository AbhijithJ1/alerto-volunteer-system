import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useMemo } from 'react';
import TaskCard from '../components/TaskCard';
import HelpNeededForm from '../components/HelpNeededForm';
import DataManagementPanel from '../components/DataManagementPanel';
import toast from 'react-hot-toast';

/* ═══════ Shared Components ═══════ */

function StatCard({ label, value, color, icon, delay = 0 }) {
  return (
    <div className="afu" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, padding:"20px 22px", animationDelay:`${delay}s`, transition:"all .3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".9px", marginBottom:8, fontWeight:500 }}>{label}</div>
          <div style={{ fontFamily:"JetBrains Mono", fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
        </div>
        <div style={{ width:38, height:38, borderRadius:9, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
      </div>
    </div>
  );
}

function Switch({ on, onChange, labelOn = "Available", labelOff = "Busy" }) {
  return (
    <div onClick={() => onChange(!on)} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
      <div style={{ width:42, height:23, borderRadius:12, background:on?"#22c55e":"var(--border-color)", border:`1px solid ${on?"#22c55e":"var(--border-hover)"}`, position:"relative", transition:"background .3s,border .3s" }}>
        <div style={{ position:"absolute", top:2, left:on?21:2, width:17, height:17, borderRadius:"50%", background:"#fff", transition:"left .22s cubic-bezier(.4,0,.2,1)", boxShadow:"0 1px 4px rgba(0,0,0,.4)" }} />
      </div>
      <span style={{ fontSize:12, color:on?"#22c55e":"var(--text-muted)", fontWeight:600 }}>{on ? labelOn : labelOff}</span>
    </div>
  );
}

function Avatar({ name, size = 30 }) {
  const palette = ["#3b82f6","#a855f7","#ef4444","#22c55e","#f59e0b","#06b6d4"];
  const c = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${c}1a`, border:`1.5px solid ${c}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.33, fontWeight:700, color:c, flexShrink:0, fontFamily:"Outfit" }}>
      {name.split(" ").map(n=>n[0]).join("")}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ background:`${color}20`, color, border:`1px solid ${color}40`, borderRadius:100, padding:"2px 9px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function SkillTag({ skill }) {
  return (
    <span style={{ background:"rgba(99,102,241,.1)", color:"#818cf8", border:"1px solid rgba(99,102,241,.2)", borderRadius:6, padding:"1px 7px", fontSize:9.5, fontWeight:600, letterSpacing:".3px" }}>{skill}</span>
  );
}

function LocationFilter({ locations, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:8, padding:"6px 12px",
      color:"var(--text-main)", fontSize:12, fontFamily:"Outfit", cursor:"pointer", outline:"none", transition:"border-color .2s"
    }}>
      <option value="all">📍 All Locations</option>
      {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
    </select>
  );
}

function SectionPanel({ title, children, style = {} }) {
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, overflow:"hidden", transition:"all .3s", ...style }}>
      <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border-color)", fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px" }}>{title}</div>
      <div style={{ padding:"12px 14px" }}>{children}</div>
    </div>
  );
}

const statusColor = { pending: "#f59e0b", accepted: "#3b82f6", completed: "#22c55e" };

/* ═══════ Main Dashboard ═══════ */

export default function DashboardPage() {
  const { user, tasks, volunteers: rawVolunteers, notifications, locations, acceptTask, declineTask, completeTask, deleteTask, toggleAvailability, toggleDnd, dismissNotification, expressInterest, approveInterest } = useApp();
  const location = useLocation();
  const screen = location.pathname.split("/")[1] || "dashboard";
  
  const [showModal, setShowModal] = useState(false);
  const [dataPanelOpen, setDataPanelOpen] = useState(false);
  const [locFilter, setLocFilter] = useState("all");

  const volunteers = useMemo(() => {
    return rawVolunteers.map(v => ({
      ...v,
      tasksCompleted: tasks.filter(t => t.status === "completed" && t.acceptedBy?.includes(v.id)).length
    }));
  }, [rawVolunteers, tasks]);

  const pending = tasks.filter(t => t.status === "pending" && user.role === "organizer");
  const volAlerts = tasks.filter(t => 
    (t.status === "pending" || t.status === "accepted") && 
    user.role === "volunteer" &&
    !(t.declinedBy?.includes(user.id) || t.acceptedBy?.includes(user.id) || t.interestedVolunteers?.includes(user.id))
  );
  
  const accepted = tasks.filter(t=>t.status==="accepted");
  const completed = tasks.filter(t=>t.status==="completed");
  const online = volunteers.filter(v=>v.available).length;

  const currentVolunteer = volunteers.find(v => v.id === user.id) || { available: true, dnd: false, skills: [] };

  const filteredPending = useMemo(() => {
    const list = user.role === "organizer" ? pending : volAlerts;
    if (locFilter === "all") return list;
    return list.filter(t => t.location === locFilter);
  }, [pending, volAlerts, locFilter, user.role]);

  const filteredTasks = useMemo(() => {
    if (locFilter === "all") return tasks;
    return tasks.filter(t => t.location === locFilter);
  }, [tasks, locFilter]);

  // Leaderboard: top volunteers by tasksCompleted
  const leaderboard = useMemo(() => 
    [...volunteers].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5),
    [volunteers]
  );

  // Smart matching: check if volunteer's skills match a task's requiredSkill
  const isMatch = (task, vol) => {
    if (!task.requiredSkill || !vol?.skills) return false;
    return vol.skills.includes(task.requiredSkill);
  };

  const handleToggle = () => {
    toggleAvailability(user.id);
    toast.success(currentVolunteer.available ? "You're now busy" : "You're now available");
  };

  const handleDndToggle = () => {
    toggleDnd(user.id);
    toast(currentVolunteer.dnd ? "DND disabled — alerts visible" : "DND enabled — alerts hidden", { icon: currentVolunteer.dnd ? "🔔" : "🔕" });
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    toast.success("Task deleted");
  };

  /* ═══════ ORGANIZER: Dashboard ═══════ */
  const renderOrgDashboard = () => {
    const total = tasks.length || 1;
    const pendingPct = Math.round((pending.length / total) * 100);
    const acceptedPct = Math.round((accepted.length / total) * 100);
    const completedPct = Math.round((completed.length / total) * 100);

    return (
      <div className="afi">
        {/* Stats Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:26 }}>
          <StatCard label="Total Tasks" value={tasks.length} color="#6366f1" icon="📋" delay={0}/>
          <StatCard label="Active Volunteers" value={online} color="#a855f7" icon="👥" delay={.06}/>
          <StatCard label="Completed" value={completed.length} color="#22c55e" icon="✅" delay={.12}/>
          <StatCard label="Pending" value={pending.length} color="#f59e0b" icon="⏳" delay={.18}/>
        </div>

        {/* Main Content: 70/30 */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
          {/* LEFT - Live Task Feed */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"var(--text-secondary)" }}>LIVE TASK FEED</div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <LocationFilter locations={locations} value={locFilter} onChange={setLocFilter} />
                <button onClick={()=>setDataPanelOpen(true)} style={{ background:"none", border:"1px solid var(--border-color)", color:"var(--text-muted)", fontSize:11, padding:"5px 10px", borderRadius:7, cursor:"pointer", fontFamily:"Outfit", fontWeight:600, transition:"all .2s" }}>⚙️ Manage</button>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filteredTasks.map((t,i) => <TaskCard key={t.id} task={t} role="organizer" onComplete={completeTask} onDelete={handleDeleteTask} delay={i*.04}/>)}
              {!filteredTasks.length && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"32px 0" }}>No tasks {locFilter !== 'all' ? `at ${locFilter}` : ''}. Click + Help Needed to create one.</div>}
            </div>
          </div>

          {/* RIGHT - Sidebar panels */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Volunteers */}
            <SectionPanel title="👥 Volunteers">
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {volunteers.map((v,i) => (
                  <div key={v.id} className="asr" style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", animationDelay:`${i*.05}s` }}>
                    <Avatar name={v.name} size={28}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--text-main)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.name}</div>
                      <div style={{ fontSize:10, color:"var(--text-muted)" }}>{v.tasksCompleted} done</div>
                    </div>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:v.available?"#22c55e":"#f59e0b", flexShrink:0 }}/>
                  </div>
                ))}
              </div>
            </SectionPanel>

            {/* Leaderboard */}
            <SectionPanel title="🏆 Leaderboard">
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {leaderboard.map((v,i) => (
                  <div key={v.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"4px 0" }}>
                    <span style={{ fontSize:13, fontWeight:800, color: i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#cd7f32":"var(--text-muted)", width:18, textAlign:"center" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}
                    </span>
                    <span style={{ fontSize:12, fontWeight:600, color:"var(--text-main)", flex:1 }}>{v.name}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#6366f1", fontFamily:"JetBrains Mono" }}>{v.tasksCompleted}</span>
                  </div>
                ))}
              </div>
            </SectionPanel>

            {/* Notifications */}
            <SectionPanel title="🔔 Notifications">
              <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:180, overflowY:"auto" }}>
                {notifications.slice(0,5).map(n => (
                  <div key={n.id} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"4px 0" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:n.type==="success"?"#22c55e":n.type==="warning"?"#f59e0b":"#3b82f6", marginTop:4, flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:"var(--text-main)", lineHeight:1.4 }}>{n.message}</div>
                    </div>
                    <button onClick={() => dismissNotification(n.id)} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:11, padding:0 }}>×</button>
                  </div>
                ))}
                {!notifications.length && <div style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", padding:"8px 0" }}>No notifications</div>}
              </div>
            </SectionPanel>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════ ORGANIZER: Tasks (dedicated) ═══════ */
  const renderOrgTasks = () => (
    <div className="afi">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"var(--text-main)" }}>Task Management</div>
        <LocationFilter locations={locations} value={locFilter} onChange={setLocFilter} />
      </div>
      {/* Status tabs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:22 }}>
        {[
          { label:"Pending", items:pending, color:"#f59e0b" },
          { label:"In Progress", items:accepted, color:"#3b82f6" },
          { label:"Completed", items:completed, color:"#22c55e" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:s.color }}/>
            <span style={{ fontSize:13, fontWeight:600, color:"var(--text-main)" }}>{s.label}</span>
            <span style={{ marginLeft:"auto", fontFamily:"JetBrains Mono", fontSize:16, fontWeight:700, color:s.color }}>{s.items.length}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filteredTasks.map((t,i) => <TaskCard key={t.id} task={t} role="organizer" onComplete={completeTask} onDelete={handleDeleteTask} delay={i*.04}/>)}
        {!filteredTasks.length && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"32px 0" }}>No tasks found</div>}
      </div>
    </div>
  );

  /* ═══════ ORGANIZER: Volunteers ═══════ */
  const renderOrgVolunteers = () => (
    <div className="afi">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"var(--text-main)" }}>Volunteer Management</div>
        <button onClick={()=>setDataPanelOpen(true)} style={{ background:"linear-gradient(135deg,#1e40af,#7c3aed)", border:"none", color:"#fff", borderRadius:8, padding:"7px 14px", fontSize:12, cursor:"pointer", fontFamily:"Outfit", fontWeight:600 }}>+ Add Volunteer</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
        {volunteers.map((v,i) => {
          const matchingTasks = pending.filter(t => isMatch(t, v));
          return (
            <div key={v.id} className="afu" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, padding:"20px", animationDelay:`${i*.06}s`, transition:"all .3s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
                <Avatar name={v.name} size={42}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:"var(--text-main)" }}>{v.name}</span>
                    {matchingTasks.length > 0 && <span style={{ background:"rgba(245,158,11,.15)", color:"#f59e0b", border:"1px solid rgba(245,158,11,.3)", borderRadius:100, padding:"1px 7px", fontSize:9, fontWeight:700 }}>⭐ BEST MATCH</span>}
                  </div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"JetBrains Mono" }}>{v.email}</div>
                </div>
              </div>
              {/* Skills */}
              {v.skills && v.skills.length > 0 && (
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                  {v.skills.map(s => <SkillTag key={s} skill={s}/>)}
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, color:"var(--text-muted)" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span>{v.tasksCompleted} completed</span>
                  {v.location && <span style={{ fontSize:10, color:"var(--text-muted)" }}>📍 {v.location}</span>}
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  <Badge label={v.available?"online":"busy"} color={v.available?"#22c55e":"#f59e0b"}/>
                  {v.dnd && <Badge label="DND" color="#ef4444"/>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════ ORGANIZER: Analytics ═══════ */
  const renderOrgAnalytics = () => {
    const total = tasks.length || 1;
    const pendingPct = Math.round((pending.length / total) * 100);
    const acceptedPct = Math.round((accepted.length / total) * 100);
    const completedPct = Math.round((completed.length / total) * 100);
    const criticalCount = tasks.filter(t => t.priority === "critical").length;
    const highCount = tasks.filter(t => t.priority === "high").length;
    const mediumCount = tasks.filter(t => t.priority === "medium").length;
    const lowCount = tasks.filter(t => t.priority === "low").length;
    const completionRate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    const responseRate = tasks.length ? Math.round(((accepted.length + completed.length) / tasks.length) * 100) : 0;

    // Location stats
    const locationStats = locations.map(loc => ({
      location: loc,
      total: tasks.filter(t => t.location === loc).length,
      pending: tasks.filter(t => t.location === loc && t.status === "pending").length,
      active: tasks.filter(t => t.location === loc && t.status === "accepted").length,
      done: tasks.filter(t => t.location === loc && t.status === "completed").length,
    }));

    return (
      <div className="afi">
        <div style={{ fontWeight:700, fontSize:16, marginBottom:20, color:"var(--text-main)" }}>📈 Analytics Dashboard</div>

        {/* Top Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:26 }}>
          <StatCard label="Total Tasks" value={tasks.length} color="#6366f1" icon="📋" delay={0}/>
          <StatCard label="Completed Tasks" value={completed.length} color="#22c55e" icon="✅" delay={.06}/>
          <StatCard label="Active Volunteers" value={online} color="#a855f7" icon="👥" delay={.12}/>
        </div>

        {/* Charts row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:26 }}>
          {/* Task Distribution */}
          <div className="afu" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, padding:"20px", animationDelay:".15s" }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px", fontWeight:600, marginBottom:16 }}>Task Distribution</div>
            {[
              { label:"Pending", pct:pendingPct, color:"#f59e0b" },
              { label:"In Progress", pct:acceptedPct, color:"#3b82f6" },
              { label:"Completed", pct:completedPct, color:"#22c55e" },
            ].map(item => (
              <div key={item.label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-secondary)", marginBottom:5 }}>
                  <span>{item.label}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontWeight:700, color:item.color }}>{item.pct}%</span>
                </div>
                <div style={{ height:8, background:"var(--border-color)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${item.pct}%`, background:item.color, borderRadius:4, transition:"width .8s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Priority Breakdown */}
          <div className="afu" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, padding:"20px", animationDelay:".2s" }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px", fontWeight:600, marginBottom:16 }}>Priority Breakdown</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { label:"Critical", count:criticalCount, color:"#ef4444" },
                { label:"High", count:highCount, color:"#f59e0b" },
                { label:"Medium", count:mediumCount, color:"#3b82f6" },
                { label:"Low", count:lowCount, color:"#22c55e" },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:12, color:"var(--text-secondary)" }}>{item.label}</span>
                  <span style={{ fontFamily:"JetBrains Mono", fontSize:15, fontWeight:700, color:item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance */}
          <div className="afu" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, padding:"20px", animationDelay:".25s" }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px", fontWeight:600, marginBottom:16 }}>Performance</div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { label:"Completion", sublabel:`${completed.length}/${tasks.length}`, rate:completionRate, color:"#22c55e" },
                { label:"Response", sublabel:`${accepted.length + completed.length} acted`, rate:responseRate, color:"#3b82f6" },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:`conic-gradient(${item.color} ${item.rate * 3.6}deg, var(--border-color) 0deg)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:"var(--bg-card)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, fontFamily:"JetBrains Mono", color:item.color }}>{item.rate}%</div>
                  </div>
                  <div><div style={{ fontSize:12, fontWeight:600, color:"var(--text-main)" }}>{item.label}</div><div style={{ fontSize:10.5, color:"var(--text-muted)" }}>{item.sublabel}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Heatmap */}
        <div className="afu" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14, padding:"20px", animationDelay:".3s" }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".8px", fontWeight:600, marginBottom:16 }}>📍 Location Activity</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>
                  {["Location","Total","Pending","Active","Completed"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"var(--text-muted)", fontWeight:600, borderBottom:"1px solid var(--border-color)", fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locationStats.map(ls => (
                  <tr key={ls.location}>
                    <td style={{ padding:"10px 12px", color:"var(--text-main)", fontWeight:600, borderBottom:"1px solid var(--border-color)" }}>📍 {ls.location}</td>
                    <td style={{ padding:"10px 12px", color:"var(--text-secondary)", borderBottom:"1px solid var(--border-color)", fontFamily:"JetBrains Mono", fontWeight:700 }}>{ls.total}</td>
                    <td style={{ padding:"10px 12px", borderBottom:"1px solid var(--border-color)" }}><Badge label={ls.pending} color="#f59e0b"/></td>
                    <td style={{ padding:"10px 12px", borderBottom:"1px solid var(--border-color)" }}><Badge label={ls.active} color="#3b82f6"/></td>
                    <td style={{ padding:"10px 12px", borderBottom:"1px solid var(--border-color)" }}><Badge label={ls.done} color="#22c55e"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════ VOLUNTEER: Dashboard ═══════ */
  const renderVolDashboard = () => {
    const myAccepted = tasks.filter(t => t.status !== "completed" && t.acceptedBy?.includes(user.id));
    const myCompleted = tasks.filter(t => t.status === "completed" && t.acceptedBy?.includes(user.id));

    return (
      <div className="afi">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
          <StatCard label="New Alerts" value={volAlerts.length} color="#ef4444" icon="🚨" delay={0}/>
          <StatCard label="My Accepted" value={myAccepted.length} color="#3b82f6" icon="⚡" delay={.06}/>
          <StatCard label="My Completed" value={myCompleted.length} color="#22c55e" icon="✅" delay={.12}/>
        </div>

        {/* Toggles row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
          {/* Availability */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:12, padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .3s" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:2, color:"var(--text-main)" }}>My Availability</div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>Toggle to accept or pause alerts</div>
            </div>
            <Switch on={currentVolunteer.available} onChange={handleToggle}/>
          </div>
          {/* DND */}
          <div style={{ background:"var(--bg-card)", border:`1px solid ${currentVolunteer.dnd ? "rgba(239,68,68,.2)" : "var(--border-color)"}`, borderRadius:12, padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .3s" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:2, color:"var(--text-main)" }}>🔕 Do Not Disturb</div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>Hide all task alerts</div>
            </div>
            <Switch on={currentVolunteer.dnd} onChange={handleDndToggle} labelOn="DND On" labelOff="Off"/>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
          <div>
            {/* DND active message */}
        {currentVolunteer.dnd ? (
          <div className="afu" style={{ textAlign:"center", padding:"48px 20px", background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔕</div>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--text-main)", marginBottom:6 }}>Do Not Disturb Active</div>
            <div style={{ fontSize:13, color:"var(--text-muted)" }}>Turn off DND to see incoming task alerts</div>
          </div>
        ) : (
          <>
            {/* Location filter + alerts */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#ef4444" }} className="pulse">🚨 LIVE ALERTS</div>
              <LocationFilter locations={locations} value={locFilter} onChange={setLocFilter}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filteredPending.map((t,i) => (
                <TaskCard key={t.id} task={t} role="volunteer" bestMatch={isMatch(t, currentVolunteer)}
                  onAccept={() => { acceptTask(t.id, user.id); toast.success(`Accepted: ${t.type}`); }}
                  onDecline={() => { declineTask(t.id, user.id); toast("Task declined", { icon:"❌" }); }}
                  delay={i*.06}/>
              ))}
              {!filteredPending.length && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"32px 0" }}>No pending alerts {locFilter !== 'all' ? `at ${locFilter}` : ''} — all clear ✓</div>}
            </div>

            {/* My active tasks */}
            {myAccepted.length > 0 && (
              <>
                <div style={{ fontWeight:700, fontSize:14, marginTop:26, marginBottom:14, color:"#3b82f6" }}>⚡ MY ACTIVE TASKS</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {myAccepted.map((t,i) => <TaskCard key={t.id} task={t} role="volunteer" delay={i*.06}/>)}
                </div>
              </>
            )}
          </>
        )}
          </div>

          {/* Right Sidebar for Volunteer */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionPanel title="🏆 Leaderboard">
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {leaderboard.map((v,i) => (
                  <div key={v.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"4px 0" }}>
                    <span style={{ fontSize:13, fontWeight:800, color: i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#cd7f32":"var(--text-muted)", width:18, textAlign:"center" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}
                    </span>
                    <span style={{ fontSize:12, fontWeight:600, color:"var(--text-main)", flex:1 }}>{v.name}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#6366f1", fontFamily:"JetBrains Mono" }}>{v.tasksCompleted}</span>
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════ VOLUNTEER: Alerts ═══════ */
  const renderVolAlerts = () => (
    <div className="afi">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"var(--text-main)" }}>All Task Alerts</div>
        <LocationFilter locations={locations} value={locFilter} onChange={setLocFilter}/>
      </div>
      {currentVolunteer.dnd ? (
        <div className="afu" style={{ textAlign:"center", padding:"48px 20px", background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:14 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🔕</div>
          <div style={{ fontSize:16, fontWeight:700, color:"var(--text-main)", marginBottom:6 }}>DND is Active</div>
          <div style={{ fontSize:13, color:"var(--text-muted)" }}>Disable Do Not Disturb to view alerts</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filteredPending.map((t,i) => (
            <TaskCard key={t.id} task={t} role="volunteer" bestMatch={isMatch(t, currentVolunteer)}
              onAccept={() => { acceptTask(t.id, user.id); toast.success(`Accepted: ${t.type}`); }}
              onDecline={() => { declineTask(t.id, user.id); toast("Declined", { icon:"❌" }); }}
              delay={i*.06}/>
          ))}
          {!filteredPending.length && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"32px 0" }}>No active alerts right now ✓</div>}
        </div>
      )}
    </div>
  );

  /* ═══════ VOLUNTEER: Task Status ═══════ */
  const renderVolTaskStatus = () => {
    const myAccepted = tasks.filter(t => t.status !== "completed" && t.acceptedBy?.includes(user.id));
    const myCompleted = tasks.filter(t => t.status === "completed" && t.acceptedBy?.includes(user.id));

    return (
      <div className="afi">
        <div style={{ fontWeight:700, fontSize:16, marginBottom:18, color:"var(--text-main)" }}>My Task History</div>
        {[
          { status:"accepted", label:"In Progress", items: myAccepted },
          { status:"completed", label:"Completed", items: myCompleted },
        ].map(({ status, label, items }) => (
          <div key={status} style={{ marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:statusColor[status] }}/>
              <span style={{ fontSize:13, fontWeight:700, color:statusColor[status] }}>{label}</span>
              <span style={{ fontSize:11, color:"var(--text-muted)" }}>({items.length})</span>
            </div>
            {items.length ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {items.map((t,i) => <TaskCard key={t.id} task={t} role="volunteer" delay={i*.05}/>)}
              </div>
            ) : <div style={{ fontSize:12, color:"var(--text-muted)", padding:"8px 0 0 16px" }}>None yet</div>}
          </div>
        ))}
      </div>
    );
  };

  /* ═══════ Router ═══════ */
  const renderContent = () => {
    if (user.role === "organizer") {
      switch (screen) {
        case "dashboard": return renderOrgDashboard();
        case "tasks": return renderOrgTasks();
        case "volunteers": return renderOrgVolunteers();
        case "analytics": return renderOrgAnalytics();
        default: return renderOrgDashboard();
      }
    } else {
      switch (screen) {
        case "dashboard": return renderVolDashboard();
        case "alerts": return renderVolAlerts();
        case "task-status": return renderVolTaskStatus();
        default: return renderVolDashboard();
      }
    }
  };

  return (
    <>
      {renderContent()}

      {user.role === "organizer" && (
        <button onClick={() => setShowModal(true)} style={{ position:"fixed", bottom:24, right:24, zIndex:90, background:"linear-gradient(135deg,#1e40af,#7c3aed)", border:"none", color:"#fff", borderRadius:100, padding:"13px 22px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Outfit", display:"flex", alignItems:"center", gap:7, animation:"fabPulse 2.5s infinite" }}>
          <span style={{ fontSize:17, lineHeight:1 }}>+</span> Help Needed
        </button>
      )}

      <HelpNeededForm isOpen={showModal} onClose={() => setShowModal(false)} />
      <DataManagementPanel isOpen={dataPanelOpen} onClose={() => setDataPanelOpen(false)} />
    </>
  );
}
