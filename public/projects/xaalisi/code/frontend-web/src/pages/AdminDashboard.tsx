import { useEffect, useState } from 'react';
import { fetchAPI } from '../services/api';
import { Users, Activity, ShieldCheck, TrendingUp, Wallet, CreditCard } from 'lucide-react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState<any>(null);
  const [txByType, setTxByType] = useState<any[]>([]);
  const [dailyVolume, setDailyVolume] = useState<any[]>([]);
  const [kycStats, setKycStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [ov, tx, daily, kyc] = await Promise.all([
          fetchAPI('/admin/stats/overview'),
          fetchAPI('/admin/stats/transactions-by-type'),
          fetchAPI('/admin/stats/daily-volume?days=7'),
          fetchAPI('/admin/stats/kyc-compliance')
        ]);
        setOverview(ov);
        setTxByType(tx);
        setDailyVolume(daily);
        setKycStats(kyc);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#8B95A5' }}>Chargement du tableau de bord...</div>;
  }

  const kpiCards = overview ? [
    { label: 'Utilisateurs Actifs', value: overview.total_users, icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Volume Total', value: `${(overview.total_volume_fcfa || 0).toLocaleString()} FCFA`, icon: TrendingUp, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Revenu XAALISI', value: `${(overview.system_revenue_fcfa || 0).toLocaleString()} FCFA`, icon: Wallet, color: '#F59E0B', bg: '#FEF3C7' },
    { label: "Transactions Aujourd'hui", value: overview.transactions_today, icon: Activity, color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'Agents Actifs', value: overview.total_agents, icon: ShieldCheck, color: '#06B6D4', bg: '#CFFAFE' },
    { label: 'Cartes Virtuelles', value: overview.total_cards, icon: CreditCard, color: '#EC4899', bg: '#FCE7F3' },
  ] : [];

  const maxVolume = Math.max(...dailyVolume.map(d => d.volume_fcfa), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Administration BI</h1>
        <p style={{ color: '#8B95A5', marginTop: '8px' }}>Tableau de bord Business Intelligence — Vue Direction Générale</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={26} color={kpi.color} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#8B95A5', fontWeight: 500 }}>{kpi.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{kpi.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Volume Chart (Bar chart using CSS) */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Volume des 7 derniers jours</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
            {dailyVolume.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: '#8B95A5', fontWeight: 600 }}>
                  {day.transaction_count}
                </div>
                <div style={{
                  width: '100%',
                  height: `${Math.max((day.volume_fcfa / maxVolume) * 160, 4)}px`,
                  background: 'linear-gradient(180deg, #FACC15 0%, #EAB308 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  transition: 'height 0.5s ease'
                }} />
                <div style={{ fontSize: '11px', color: '#555E6E', fontWeight: 500 }}>
                  {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Types */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Par Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {txByType.length === 0 ? (
              <p style={{ color: '#8B95A5', textAlign: 'center' }}>Aucune donnée</p>
            ) : (
              txByType.map((item, i) => {
                const totalTx = txByType.reduce((a, b) => a + b.count, 0);
                const pct = totalTx > 0 ? (item.count / totalTx) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{item.type}</span>
                      <span style={{ color: '#8B95A5' }}>{item.count}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#141820', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #FACC15, #EAB308)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* KYC Compliance */}
      {kycStats && (
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Conformité KYC</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#3B82F6' }}>{kycStats.kyc_tier_1}</div>
              <div style={{ fontSize: '13px', color: '#8B95A5', marginTop: '4px' }}>Tier 1</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>{kycStats.kyc_tier_2}</div>
              <div style={{ fontSize: '13px', color: '#8B95A5', marginTop: '4px' }}>Tier 2</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B' }}>{kycStats.kyc_tier_3}</div>
              <div style={{ fontSize: '13px', color: '#8B95A5', marginTop: '4px' }}>Tier 3</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444' }}>{kycStats.locked_accounts}</div>
              <div style={{ fontSize: '13px', color: '#8B95A5', marginTop: '4px' }}>Bloqués</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>{kycStats.verification_rate_pct}%</div>
              <div style={{ fontSize: '13px', color: '#8B95A5', marginTop: '4px' }}>Taux Vérification</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
