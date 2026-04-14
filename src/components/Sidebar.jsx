import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = {
  organizer: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/tasks', icon: '📋', label: 'Tasks' },
    { path: '/volunteers', icon: '👥', label: 'Volunteers' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
  ],
  volunteer: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/alerts', icon: '🚨', label: 'Alerts' },
    { path: '/task-status', icon: '📌', label: 'Task Status' },
  ],
};

export default function Sidebar() {
  const { user, sidebarCollapsed, toggleSidebar } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const items = navItems[user.role] || [];
  const currentPath = location.pathname;
  const collapsed = sidebarCollapsed;

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 12px' : '18px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-color)', minHeight: 60, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#1e40af,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>🚨</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px', lineHeight: 1, color: 'var(--text-main)' }}>
              <span style={{ color: '#60a5fa' }}>Alert</span>o
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.5px', marginTop: 2 }}>proddec cec</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', padding: '4px 10px 8px', fontWeight: 600 }}>Navigation</div>
        )}
        {items.map(item => {
          const active = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: collapsed ? '11px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'rgba(99,102,241,.12)' : 'transparent',
                border: 'none',
                borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
                borderRadius: collapsed ? 8 : '0 10px 10px 0',
                color: active ? '#818cf8' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'Outfit',
                transition: 'all .2s',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = active ? '#818cf8' : 'var(--text-secondary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#818cf8' : 'var(--text-muted)'; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop: '1px solid var(--border-color)', padding: collapsed ? '12px 8px' : '14px 14px', flexShrink: 0 }}>
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 9,
            background: 'rgba(255,255,255,.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Outfit',
            fontWeight: 500,
            transition: 'all .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
        >
          <span style={{ fontSize: 14, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .28s', lineHeight: 1 }}>◀</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: user.role === 'organizer' ? '#a855f7' : '#3b82f6', animation: 'pulse 1.6s infinite' }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
              {user.role}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
