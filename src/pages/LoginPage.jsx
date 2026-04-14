import { useState } from 'react';
import { useApp } from '../context/AppContext';

function Spinner() {
  return (
    <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,.12)", borderTopColor:"#3b82f6", animation:"spin .65s linear infinite", display:"inline-block", flexShrink:0 }} />
  );
}

export default function LoginPage() {
  const { login, authenticate } = useApp();
  const [role, setRole] = useState("organizer");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [focused, setFocused] = useState(null);

  const accent = role === "organizer" ? "#7c3aed" : "#3b82f6";

  const handle = async () => {
    if (!email || !pass) { 
      setErr("Please fill in all fields."); 
      return; 
    }
    if (!email.includes('@')) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (pass.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    setErr(""); setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const result = authenticate(email, pass);
    setLoading(false);
    
    if (!result.success) {
      setErr("Invalid email or password.");
      return;
    }
    // Verify role match
    if (result.user.role !== role) {
      setErr(`This account is not a ${role}. Please select the correct role.`);
      return;
    }
    login(result.user);
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

      <div className="afu" style={{ background:"rgba(13,16,23,.88)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,.09)", borderRadius:20, padding:"34px 32px", width:"min(420px,95vw)", zIndex:1, boxShadow:"0 32px 80px rgba(0,0,0,.65)" }}>
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ width:50, height:50, borderRadius:13, margin:"0 auto 11px", background:"linear-gradient(135deg,#1e40af,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, boxShadow:`0 8px 24px ${accent}40` }}>🚨</div>
          <div style={{ fontWeight:900, fontSize:21, letterSpacing:"-1px", color:"#e8e8f0" }}><span style={{ color:"#60a5fa" }}>Alert</span>o</div>
          <div style={{ fontSize:11, color:"#3a3c50", marginTop:2 }}>Real-Time Volunteer Dispatch System</div>
        </div>

        {/* Sign In only — no signup (organizer controls accounts) */}
        <div style={{ textAlign:"center", fontSize:12, color:"#4a4c5e", marginBottom:18, fontWeight:500 }}>
          Sign in to your account
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:18 }}>
          {[["organizer","🏢","Organizer","#7c3aed"],["volunteer","🙋","Volunteer","#3b82f6"]].map(([r,icon,label,c]) => (
            <button key={r} onClick={() => { setRole(r); setErr(""); }} style={{ flex:1, background:role===r?`${c}1a`:"rgba(255,255,255,.04)", border:`1px solid ${role===r?`${c}50`:"rgba(255,255,255,.07)"}`, borderRadius:10, padding:"10px 6px", cursor:"pointer", fontFamily:"Outfit", color:role===r?c:"#4a4c5e", fontSize:12, fontWeight:700, transition:"all .25s" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handle(); }}>
          <div style={{ marginBottom:12 }}><input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)} style={inp("email")} /></div>
          <div style={{ marginBottom: err ? 12 : 18 }}><input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onFocus={()=>setFocused("pass")} onBlur={()=>setFocused(null)} style={inp("pass")} /></div>
          {err && <div className="afu" style={{ color:"#ef4444", fontSize:12, marginBottom:12, textAlign:"center", background:"rgba(239,68,68,.08)", padding:"8px 10px", borderRadius:8, border:"1px solid rgba(239,68,68,.15)" }}>{err}</div>}

          <button type="submit" disabled={loading} style={{ width:"100%", background:`linear-gradient(135deg,#1e40af,${accent})`, border:"none", color:"#fff", borderRadius:11, padding:"12px", fontSize:14, fontWeight:700, cursor:loading?"default":"pointer", fontFamily:"Outfit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"opacity .2s,transform .15s", opacity:loading?.8:1 }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform="translateY(-1px)")}
            onMouseLeave={e => e.currentTarget.style.transform=""}>
            {loading ? <><Spinner/> Signing in...</> : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"#3a3c50" }}>Secured by Alerto · proddec cec</div>
      </div>
    </div>
  );
}
