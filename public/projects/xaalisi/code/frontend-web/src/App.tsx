import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import PayBills from './pages/PayBills';
import Beneficiaries from './pages/Beneficiaries';
import Cards from './pages/Cards';
import Statements from './pages/Statements';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import Developer from './pages/Developer';
import History from './pages/History';
import Limits from './pages/Limits';
import Security from './pages/Security';
import AIChat from './pages/AIChat';
import Workflows from './pages/Workflows';
import Tontines from './pages/Tontines';
import Landing from './pages/Landing';

import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading, logout } = useAuth();
  
  useEffect(() => {
    if (!token) return;

    let timeoutId: number;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 5 minutes inactivity timeout
      timeoutId = window.setTimeout(() => {
        logout();
      }, 300000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [token, logout]);
  
  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Landing />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/bills" element={<PayBills />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/statements" element={<Statements />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/support" element={<Support />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/limits" element={<Limits />} />
        <Route path="/security" element={<Security />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/tontines" element={<Tontines />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
