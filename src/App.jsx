import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }) {
  const { user, sidebarCollapsed } = useApp();
  if (!user) return <Navigate to="/" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`main-area${sidebarCollapsed ? ' collapsed' : ''}`}>
        <Navbar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/volunteers" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/task-status" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1f2e',
              borderLeft: '3px solid #3b82f6',
              color: '#e8e8f0',
              borderRadius: '10px',
              fontSize: '12.5px',
              padding: '11px 15px',
              boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
            },
            success: {
              style: {
                borderLeft: '3px solid #22c55e',
              },
            },
            error: {
              style: {
                borderLeft: '3px solid #ef4444',
              },
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  );
}
