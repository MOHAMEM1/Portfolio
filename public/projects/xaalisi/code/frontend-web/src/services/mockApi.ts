// src/services/mockApi.ts

const initialData = {
  users: {
    '770000000': { password: 'password123', name: 'Souleymane Diallo', role: 'USER' },
    'admin': { password: 'admin', name: 'Admin Xaalisi', role: 'ADMIN' }
  },
  wallets: [
    { currency: 'XOF', balance: 540000.0, is_default: true, status: 'ACTIVE' },
    { currency: 'EUR', balance: 150.0, is_default: false, status: 'ACTIVE' }
  ],
  transactions: [
    { id: 1, amount: -15000, type: 'TRANSFER', status: 'COMPLETED', created_at: new Date(Date.now() - 86400000).toISOString(), description: 'Transfert vers Alioune' },
    { id: 2, amount: 50000, type: 'DEPOSIT', status: 'COMPLETED', created_at: new Date(Date.now() - 172800000).toISOString(), description: 'Recharge compte' },
    { id: 3, amount: -5000, type: 'BILL_PAYMENT', status: 'COMPLETED', created_at: new Date(Date.now() - 259200000).toISOString(), description: 'Paiement Facture SENELEC' },
  ],
  cards: [
    { id: 1, card_number: '5432********1234', cardholder_name: 'SOULEYMANE DIALLO', expiry_month: 12, expiry_year: 2026, status: 'ACTIVE', daily_limit: 500000 }
  ],
  beneficiaries: [
    { id: 1, name: 'Alioune Fall', phone: '778889900', bank_name: 'Ecobank' }
  ],
  notifications: [
    { id: 1, message: 'Votre transfert de 15,000 XOF a été effectué.', is_read: false, created_at: new Date().toISOString() }
  ]
};

// Initialize LocalStorage if empty
if (!localStorage.getItem('xaalisi_mock_db')) {
  localStorage.setItem('xaalisi_mock_db', JSON.stringify(initialData));
}

function getDb() {
  return JSON.parse(localStorage.getItem('xaalisi_mock_db') || '{}');
}

function saveDb(db: any) {
  localStorage.setItem('xaalisi_mock_db', JSON.stringify(db));
}

export async function handleMockRequest(endpoint: string, options: RequestInit) {
  const db = getDb();
  const method = options.method || 'GET';
  
  console.log(`[MOCK API] ${method} ${endpoint}`);
  
  // Simulate network delay
  await new Promise(r => setTimeout(r, 600));
  
  const token = localStorage.getItem('userToken');
  const isLoggedIn = !!token;
  const username = localStorage.getItem('username') || '770000000';

  if (endpoint.startsWith('/auth/login') && method === 'POST') {
    // Basic auth logic
    const bodyText = options.body?.toString() || '';
    const params = new URLSearchParams(bodyText);
    const user = params.get('username');
    const pwd = params.get('password');
    
    if (db.users[user as string] && (db.users[user as string].password === pwd || db.users[user as string].pin === pwd)) {
      localStorage.setItem('username', user as string);
      return { access_token: `mock_token_${user}`, token_type: 'bearer' };
    }
    throw new Error('Identifiant ou mot de passe incorrect.');
  }
  
  if (endpoint.startsWith('/auth/register') && method === 'POST') {
    const body = JSON.parse(options.body as string || '{}');
    const user = body.username || body.phone; // Assuming the username/phone is in the body
    const pwd = body.password;
    const pin = body.pin_code;
    if (user && pwd) {
      db.users[user] = { password: pwd, pin: pin, name: 'Nouvel Utilisateur', role: 'USER' };
      saveDb(db);
    }
    return { message: "Compte créé avec succès (Mock)" };
  }
  
  if (endpoint.startsWith('/digital-banking/me/dashboard')) {
    if (!isLoggedIn) throw new Error('Unauthorized');
    return {
      user: { username, kyc_status: 'VERIFIED', kyc_tier: 2, role: db.users[username]?.role || 'USER' },
      wallets: db.wallets,
      recent_transactions: db.transactions.slice(0, 5),
      cards: db.cards
    };
  }

  if (endpoint.startsWith('/transactions/history')) {
    return db.transactions;
  }
  
  if (endpoint.startsWith('/transactions/transfer') && method === 'POST') {
    const body = JSON.parse(options.body as string || '{}');
    db.transactions.unshift({
      id: Date.now(),
      amount: -body.amount,
      type: 'TRANSFER',
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      description: `Transfert vers ${body.receiver_phone}`
    });
    db.wallets[0].balance -= body.amount;
    saveDb(db);
    return { message: 'Transfert effectué avec succès' };
  }
  
  if (endpoint.startsWith('/cards/virtual')) {
    if (method === 'GET') return db.cards;
    if (method === 'POST') {
      db.cards.push({
        id: Date.now(),
        card_number: '5432********' + Math.floor(1000 + Math.random() * 9000),
        cardholder_name: username.toUpperCase(),
        expiry_month: 12,
        expiry_year: 2027,
        status: 'ACTIVE',
        daily_limit: 500000
      });
      saveDb(db);
      return { message: 'Carte créée' };
    }
  }
  
  if (endpoint.startsWith('/beneficiaries/')) {
    if (method === 'GET') return db.beneficiaries;
  }
  
  if (endpoint.startsWith('/notifications/')) {
    if (method === 'GET') return db.notifications;
  }
  
  if (endpoint.startsWith('/admin/stats/overview')) {
    return { users: 1542, volume: 15000000, revenue: 150000, active_cards: 845 };
  }

  // Fallback for everything else
  return { message: 'Mock response ok', data: [] };
}
