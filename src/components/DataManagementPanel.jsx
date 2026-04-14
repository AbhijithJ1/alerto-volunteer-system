import { useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function DataManagementPanel({ isOpen, onClose }) {
  const { 
    volunteers, addVolunteer, deleteVolunteer,
    locations, addLocation, deleteLocation,
    taskTypes, addTaskType, deleteTaskType,
    tasks, deleteTask,
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('volunteers');
  const [inputValue, setInputValue] = useState('');
  // Volunteer creation fields
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPass, setVolPass] = useState('');

  const TABS = [
    { id: 'volunteers', label: '👥 Volunteers' },
    { id: 'locations', label: '📍 Locations' },
    { id: 'tasks', label: '📋 Task Types' },
    { id: 'allTasks', label: '🗂️ All Tasks' },
  ];

  const handleAddSimple = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const value = inputValue.trim();

    if (activeTab === 'locations') {
      addLocation(value);
      toast.success(`Location "${value}" added`);
    } else if (activeTab === 'tasks') {
      addTaskType(value);
      toast.success(`Task Type "${value}" added`);
    }
    setInputValue('');
  };

  const handleAddVolunteer = (e) => {
    e.preventDefault();
    if (!volName.trim() || !volEmail.trim() || !volPass.trim()) {
      toast.error('Fill in all volunteer fields');
      return;
    }
    if (!volEmail.includes('@')) {
      toast.error('Enter a valid email');
      return;
    }
    if (volPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    // Check if email already exists
    if (volunteers.find(v => v.email === volEmail.trim())) {
      toast.error('A volunteer with this email already exists');
      return;
    }
    addVolunteer({ name: volName.trim(), email: volEmail.trim(), password: volPass.trim() });
    toast.success(`Volunteer "${volName.trim()}" created`);
    setVolName(''); setVolEmail(''); setVolPass('');
  };

  const handleDelete = (idOrValue) => {
    if (activeTab === 'volunteers') {
      deleteVolunteer(idOrValue);
      toast('Volunteer removed', { icon: '🗑️' });
    } else if (activeTab === 'locations') {
      deleteLocation(idOrValue);
      toast('Location removed', { icon: '🗑️' });
    } else if (activeTab === 'tasks') {
      deleteTaskType(idOrValue);
      toast('Task type removed', { icon: '🗑️' });
    } else if (activeTab === 'allTasks') {
      deleteTask(idOrValue);
      toast('Task deleted', { icon: '🗑️' });
    }
  };

  if (!isOpen) return null;

  const fieldStyle = {
    flex:1, background:"var(--bg-card)", border:"1px solid var(--border-color)",
    borderRadius:10, padding:"10px 14px", color:"var(--text-main)", fontSize:13,
    fontFamily:"Outfit", outline:"none", transition:"border-color .2s"
  };

  const itemStyle = {
    display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px",
    borderRadius:10, border:"1px solid var(--border-color)", background:"var(--bg-accent)", transition:"all .2s"
  };

  const delBtnStyle = {
    background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444",
    borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:"Outfit", fontWeight:600
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", animation:"fadeIn .2s" }} onClick={onClose}>
      <div className="aex" style={{ background:"var(--bg-card)", border:"1px solid var(--border-color)", borderRadius:18, width:"min(540px,95vw)", maxHeight:"85vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,.5)", overflow:"hidden" }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 22px", borderBottom:"1px solid var(--border-color)" }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:"var(--text-main)" }}>⚙️ System Management</div>
            <div style={{ fontSize:11.5, color:"var(--text-muted)", marginTop:3 }}>Full control: volunteers, locations, task types & tasks</div>
          </div>
          <button onClick={onClose} style={{ background:"var(--border-color)", border:"none", color:"var(--text-muted)", width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:17, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, padding:"8px 22px 0", borderBottom:"1px solid var(--border-color)", overflowX:"auto" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background:"none", border:"none", padding:"8px 12px", fontSize:12, fontWeight:600,
              cursor:"pointer", fontFamily:"Outfit", color: activeTab===tab.id ? "var(--text-main)" : "var(--text-muted)",
              borderBottom: activeTab===tab.id ? "2px solid #7c3aed" : "2px solid transparent",
              transition:"all .2s", marginBottom:-1, whiteSpace:"nowrap"
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding:"18px 22px", flex:1, overflowY:"auto" }}>

          {/* Volunteer Creation Form */}
          {activeTab === 'volunteers' && (
            <form onSubmit={handleAddVolunteer} style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16, background:"var(--bg-accent)", border:"1px solid var(--border-color)", borderRadius:12, padding:14 }}>
              <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:".5px" }}>Create New Volunteer</div>
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="Name" value={volName} onChange={e=>setVolName(e.target.value)} style={fieldStyle} />
                <input placeholder="Email" value={volEmail} onChange={e=>setVolEmail(e.target.value)} style={fieldStyle} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input type="password" placeholder="Password (min 6)" value={volPass} onChange={e=>setVolPass(e.target.value)} style={fieldStyle} />
                <button type="submit" style={{
                  background:"linear-gradient(135deg,#1e40af,#7c3aed)", border:"none", color:"#fff",
                  borderRadius:10, padding:"10px 18px", fontSize:12, cursor:"pointer",
                  fontFamily:"Outfit", fontWeight:700, whiteSpace:"nowrap"
                }}>+ Add</button>
              </div>
            </form>
          )}

          {/* Simple Add Form for locations/task types */}
          {(activeTab === 'locations' || activeTab === 'tasks') && (
            <form onSubmit={handleAddSimple} style={{ display:"flex", gap:8, marginBottom:16 }}>
              <input 
                placeholder={`Add new ${activeTab === 'tasks' ? 'task type' : 'location'}...`} 
                value={inputValue} onChange={e => setInputValue(e.target.value)} style={fieldStyle}
              />
              <button type="submit" disabled={!inputValue.trim()} style={{
                background:"linear-gradient(135deg,#1e40af,#7c3aed)", border:"none", color:"#fff",
                borderRadius:10, padding:"10px 16px", fontSize:16, cursor: inputValue.trim() ? "pointer" : "default",
                fontFamily:"Outfit", fontWeight:700, opacity: inputValue.trim() ? 1 : 0.5, transition:"opacity .2s"
              }}>+</button>
            </form>
          )}

          {/* Items List */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {activeTab === 'volunteers' && volunteers.map(v => (
              <div key={v.id} style={itemStyle}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:v.available ? "#22c55e" : "#f59e0b" }} />
                  <div>
                    <span style={{ fontSize:13, fontWeight:600, color:"var(--text-main)" }}>{v.name}</span>
                    <div style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"JetBrains Mono" }}>{v.email}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(v.id)} style={delBtnStyle}>Delete</button>
              </div>
            ))}

            {activeTab === 'locations' && locations.map(l => (
              <div key={l} style={itemStyle}>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--text-main)" }}>📍 {l}</span>
                <button onClick={() => handleDelete(l)} style={delBtnStyle}>Delete</button>
              </div>
            ))}

            {activeTab === 'tasks' && taskTypes.map(t => (
              <div key={t} style={itemStyle}>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--text-main)" }}>{t}</span>
                <button onClick={() => handleDelete(t)} style={delBtnStyle}>Delete</button>
              </div>
            ))}

            {activeTab === 'allTasks' && tasks.map(t => (
              <div key={t.id} style={itemStyle}>
                <div>
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--text-main)" }}>{t.type}</span>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{t.location} · {t.status}</div>
                </div>
                <button onClick={() => handleDelete(t.id)} style={delBtnStyle}>Delete</button>
              </div>
            ))}

            {activeTab === 'allTasks' && !tasks.length && (
              <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:12, padding:"20px 0" }}>No tasks to manage</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
