import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const features = [
  { icon: "⚡", title: "Real-Time Alerts", desc: "Instant task dispatch to all available volunteers. Zero delay, zero confusion.", color: "#6366f1" },
  { icon: "🧠", title: "Smart Matching", desc: "Auto-match volunteers to tasks based on skills and proximity for faster response.", color: "#f59e0b" },
  { icon: "📊", title: "Live Analytics", desc: "Track completion rates, response times, and volunteer performance in real-time.", color: "#22c55e" },
];

const stats = [
  { value: "< 3s", label: "Alert Delivery" },
  { value: "95%", label: "Response Rate" },
  { value: "24/7", label: "Uptime" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#07090f", position:"relative", overflow:"hidden" }}>
      {/* Background layers */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.018) 1px, transparent 1px)", backgroundSize:"42px 42px", pointerEvents:"none", animation:"gridDrift 20s linear infinite" }} />
      <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.12), transparent 65%)", top:"-15%", left:"-8%", pointerEvents:"none", animation:"glowPulse 4s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:550, height:550, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,0.08), transparent 65%)", bottom:"-10%", right:"-5%", pointerEvents:"none", animation:"glowPulse 5s ease-in-out infinite 1s" }} />
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.06), transparent 65%)", top:"40%", right:"20%", pointerEvents:"none", animation:"glowPulse 6s ease-in-out infinite 2s" }} />

      {/* Hero Section */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", position:"relative", zIndex:1, padding:"0 24px" }}>
        {/* Logo */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
          transition:"all 0.7s cubic-bezier(.4,0,.2,1)",
          width:80, height:80, borderRadius:22, background:"linear-gradient(135deg, #1e40af, #7c3aed)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:32,
          boxShadow:"0 16px 48px rgba(124,58,237,0.4), 0 0 80px rgba(99,102,241,0.15)",
        }}>
          🚨
        </div>
        
        {/* Title */}
        <h1 style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition:"all 0.7s cubic-bezier(.4,0,.2,1) .15s",
          fontSize:"clamp(3rem, 8vw, 5rem)", fontWeight:900, lineHeight:1,
          letterSpacing:"-3px", marginBottom:12, textAlign:"center",
          background:"linear-gradient(135deg, #e8e8f0 30%, #6366f1 70%, #a855f7)",
          backgroundSize:"200% 200%", animation:"gradientShift 4s ease infinite",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        }}>
          Alerto
        </h1>
        
        {/* Subtitle */}
        <p style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
          transition:"all 0.6s cubic-bezier(.4,0,.2,1) .3s",
          fontSize:"clamp(1.1rem, 3vw, 1.4rem)", color:"#8b8da0", maxWidth:520, lineHeight:1.5,
          marginBottom:8, fontWeight:600, textAlign:"center",
        }}>
          Real-Time Volunteer Coordination
        </p>
        
        {/* Description */}
        <p style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
          transition:"all 0.6s cubic-bezier(.4,0,.2,1) .4s",
          fontSize:"clamp(0.9rem, 2vw, 1.05rem)", color:"#4a4c5e", maxWidth:480,
          lineHeight:1.7, marginBottom:40, fontWeight:400, textAlign:"center",
        }}>
          Instant alerts. Fast response. Zero chaos.<br/>The ultimate dispatch system for live events.
        </p>
        
        {/* CTA Button */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
          transition:"all 0.5s cubic-bezier(.4,0,.2,1) .5s",
        }}>
          <button 
            onClick={() => navigate('/login')} 
            style={{
              padding:"16px 48px", borderRadius:100,
              background:"linear-gradient(135deg, #1e40af, #7c3aed)",
              color:"#fff", border:"none", fontSize:"1.1rem", fontWeight:700,
              cursor:"pointer", fontFamily:"Outfit", position:"relative",
              boxShadow:"0 8px 32px rgba(124,58,237,0.4), 0 0 60px rgba(99,102,241,0.1)",
              transition:"transform 0.2s, box-shadow 0.3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(124,58,237,0.55), 0 0 80px rgba(99,102,241,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 32px rgba(124,58,237,0.4), 0 0 60px rgba(99,102,241,0.1)"; }}
          >
            Get Started →
          </button>
        </div>

        {/* Stats bar */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
          transition:"all 0.5s cubic-bezier(.4,0,.2,1) .65s",
          display:"flex", gap:40, marginTop:56,
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#e8e8f0", fontFamily:"JetBrains Mono", letterSpacing:"-1px" }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#4a4c5e", marginTop:2, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:6,
          opacity: visible ? .5 : 0, transition:"opacity 1s ease 1s",
        }}>
          <div style={{ fontSize:10, color:"#4a4c5e", letterSpacing:"1px", textTransform:"uppercase" }}>Explore</div>
          <div style={{ width:1, height:24, background:"linear-gradient(to bottom, #4a4c5e, transparent)", animation:"pulse 2s infinite" }}/>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ position:"relative", zIndex:1, padding:"60px 24px 80px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:10, color:"#6366f1", textTransform:"uppercase", letterSpacing:"2px", fontWeight:700, marginBottom:8 }}>Features</div>
          <h2 style={{ fontSize:"clamp(1.5rem, 4vw, 2rem)", fontWeight:800, color:"#e8e8f0", letterSpacing:"-1px" }}>Built for Crisis Response</h2>
          <p style={{ fontSize:14, color:"#4a4c5e", marginTop:8, maxWidth:400, margin:"8px auto 0" }}>Every feature designed to save time when it matters most</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:20 }}>
          {features.map((f, i) => (
            <div key={f.title} className="afu" style={{
              background:"rgba(13,16,23,.8)", border:"1px solid var(--border-color)", borderRadius:16,
              padding:"28px 24px", animationDelay:`${.3 + i * .12}s`, transition:"all .3s",
              cursor:"default",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}15`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ width:48, height:48, borderRadius:12, background:`${f.color}15`, border:`1px solid ${f.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:18 }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#e8e8f0", marginBottom:8 }}>{f.title}</div>
              <div style={{ fontSize:13, color:"#6a6c80", lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"0 24px 32px" }}>
        <div style={{ width:60, height:1, background:"linear-gradient(90deg, transparent, var(--border-color), transparent)", margin:"0 auto 20px" }}/>
        <div style={{ fontSize:11, color:"#4a4c5e" }}>
          Developed by <span 
            style={{ fontWeight:700, color:"#8b8da0", cursor:"pointer", transition:"all 0.3s ease", display:"inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.textShadow = "0 0 12px rgba(124,58,237,0.8), 0 0 24px rgba(59,130,246,0.6)"; e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8b8da0"; e.currentTarget.style.textShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
          >proddec cec</span>
        </div>
      </div>
    </div>
  );
}
