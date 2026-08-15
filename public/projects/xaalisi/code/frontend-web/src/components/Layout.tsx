import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Send, FileText, LogOut, Wallet, Users, CreditCard, FileBarChart, Bell, HelpCircle, ShieldCheck, Code, Clock, Lock, Shield, Globe, Sparkles, CheckSquare, Landmark } from 'lucide-react';

const Layout = () => {
  const { username, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const navItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.history'), path: '/history', icon: Clock },
    { name: t('nav.transfer'), path: '/transfer', icon: Send },
    { name: t('nav.bills'), path: '/bills', icon: FileText },
    { name: t('nav.beneficiaries'), path: '/beneficiaries', icon: Users, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: t('nav.cards'), path: '/cards', icon: CreditCard, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: 'Darét (Tontines)', path: '/tontines', icon: Landmark, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: t('nav.statements'), path: '/statements', icon: FileBarChart, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: t('nav.limits'), path: '/limits', icon: Shield },
    { name: t('nav.security'), path: '/security', icon: Lock },
    { name: 'Assistant IA', path: '/ai-chat', icon: Sparkles, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: t('nav.notifications'), path: '/notifications', icon: Bell, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: t('nav.support'), path: '/support', icon: HelpCircle, roles: ['USER', 'ENTREPRISE', 'ADMIN'] },
    { name: 'Approbations', path: '/workflows', icon: CheckSquare, roles: ['ENTREPRISE', 'ADMIN'] },
    { name: t('nav.developer'), path: '/developer', icon: Code, roles: ['ENTREPRISE', 'ADMIN'] },
    { name: t('nav.admin'), path: '/admin', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar — Dark with Gold accents */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', padding: '0 8px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #AA820A 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}>
            <Wallet color="#0B0E11" size={22} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#D4AF37', letterSpacing: '-0.5px' }}>XAALISI</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.filter(item => !item.roles || item.roles.includes(role || 'USER')).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: '#EF4444',
            fontWeight: 600,
            fontSize: '14px',
            marginTop: 'auto',
            transition: 'all 0.2s',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}
        >
          <LogOut size={20} />
          Se déconnecter
        </button>
      </aside>

      <main className="main-content">
        <header className="header-top">
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
            {navItems.find(i => i.path === location.pathname)?.name || t('nav.dashboard')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleLanguage}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <Globe size={16} />
              {i18n.language.toUpperCase()}
            </button>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{username}</div>
              <div style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 500 }}>Verified Account</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #AA820A)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(212, 175, 55, 0.3)' }}>
              <span style={{ fontWeight: 700, color: '#0B0E11', fontSize: '16px' }}>{username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
