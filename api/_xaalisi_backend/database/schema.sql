-- PostgreSQL Schema pour la plateforme XAALISI (Core Ledger)
-- Créé pour l'équipe Data (Data & Database Team)

-- 1. Types ENUM (Pour forcer l'intégrité des données au niveau de la base)
CREATE TYPE role_enum AS ENUM ('ADMIN', 'AGENT', 'USER', 'ENTREPRISE');
CREATE TYPE transaction_status_enum AS ENUM ('INITIATED', 'VALIDATED', 'AUTHORIZED', 'CAPTURED', 'SETTLED', 'FAILED', 'REVERSED');
CREATE TYPE transaction_type_enum AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'TONTINE_CONTRIBUTION', 'TONTINE_PAYOUT');
CREATE TYPE entry_type_enum AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE tontine_frequency_enum AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE tontine_status_enum AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- 2. Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    pin_code VARCHAR(255),
    role role_enum DEFAULT 'USER' NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    failed_pin_attempts INTEGER DEFAULT 0 NOT NULL,
    kyc_tier INTEGER DEFAULT 1 NOT NULL,
    -- Progressive KYC Fields (Level 2/3)
    full_name VARCHAR(255),
    date_of_birth DATE,
    id_type VARCHAR(50), -- NINA, CNI, PASSPORT, FOREIGN_ID
    id_number VARCHAR(100),
    selfie_url TEXT,
    id_document_url TEXT,
    city VARCHAR(100),
    quartier VARCHAR(255),
    profession VARCHAR(255),
    kyc_submitted_at TIMESTAMP WITH TIME ZONE,
    kyc_approved_at TIMESTAMP WITH TIME ZONE,
    -- Diaspora & AML
    is_diaspora BOOLEAN DEFAULT FALSE,
    aml_flag BOOLEAN DEFAULT FALSE,
    foreign_country VARCHAR(100),
    residence_permit VARCHAR(100)
);

CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    currency VARCHAR(10) DEFAULT 'FCFA' NOT NULL,
    status transaction_status_enum DEFAULT 'SETTLED' NOT NULL,
    transaction_type transaction_type_enum DEFAULT 'TRANSFER' NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE, -- RÈGLE D'IDEMPOTENCE AU NIVEAU DE LA BD
    external_reference VARCHAR(255),
    description TEXT
);

CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    -- RÈGLE ANTI-DOUBLE DÉBIT & TROU NOIR AU NIVEAU DE LA BD (L'montant dima positif)
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0), 
    entry_type entry_type_enum NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(255) NOT NULL,
    action_type VARCHAR(255) NOT NULL,
    target_username VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tontine_groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    creator_id VARCHAR(255) NOT NULL,
    contribution_amount NUMERIC(15, 2) NOT NULL CHECK (contribution_amount > 0),
    frequency tontine_frequency_enum NOT NULL,
    status tontine_status_enum DEFAULT 'PENDING' NOT NULL,
    current_cycle INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE tontine_members (
    id SERIAL PRIMARY KEY,
    tontine_id VARCHAR(36) NOT NULL,
    username VARCHAR(255) NOT NULL,
    payout_order INTEGER NOT NULL,
    total_contributed NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tontine_id) REFERENCES tontine_groups(id) ON DELETE CASCADE,
    UNIQUE(tontine_id, username),
    UNIQUE(tontine_id, payout_order)
);

-- 3. Indexes (Pour la performance et les recherches rapides)
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_transactions_idempotency_key ON transactions(idempotency_key);
CREATE INDEX idx_entries_account_id ON entries(account_id);
CREATE INDEX idx_admin_audit_logs_admin_username ON admin_audit_logs(admin_username);
CREATE INDEX idx_admin_audit_logs_target_username ON admin_audit_logs(target_username);

-- 4. Notifications (Added for Frontend UI Sync)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_username ON notifications(username);

-- 5. Cards Management (Physical & Virtual)
CREATE TABLE cards (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    card_type VARCHAR(50) DEFAULT 'VIRTUAL' NOT NULL, -- VIRTUAL or PHYSICAL
    card_number_masked VARCHAR(20) NOT NULL,
    expiration_date VARCHAR(5) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL, -- ACTIVE, FROZEN, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_cards_username ON cards(username);

-- 6. User Activity Logs (Profile updates, card cuts, settings changes)
CREATE TABLE user_activity_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL, -- e.g., 'CARD_CREATED', 'PIN_CHANGED', 'PROFILE_UPDATED'
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_user_activity_username ON user_activity_logs(username);

-- 7. Agent Network (Onboarding & Geolocation)
CREATE TABLE agents (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bamako',
    quartier VARCHAR(255),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED, REJECTED, SUSPENDED
    commission_rate NUMERIC(5, 2) DEFAULT 1.5 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE INDEX idx_agents_username ON agents(username);
CREATE INDEX idx_agents_city ON agents(city);

-- 8. KYC Dynamic Ceilings (Transaction Limits per KYC Level)
CREATE TABLE kyc_ceilings (
    kyc_tier INTEGER PRIMARY KEY,
    daily_limit NUMERIC(15, 2) NOT NULL,
    monthly_limit NUMERIC(15, 2) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT
);

-- Seed default ceiling data
INSERT INTO kyc_ceilings (kyc_tier, daily_limit, monthly_limit, label, description) VALUES
    (1, 200000.00,   500000.00,    'Standard',  'Inclusion immédiate — téléphone + OTP uniquement'),
    (2, 2000000.00,  10000000.00,  'Vérifié',   'Pièce identité + Selfie requis'),
    (3, 5000000.00,  50000000.00,  'Premium',   'Identité complète + Justificatif domicile + Profession');

-- 9. Accounts (Digital Banking Support)
CREATE TABLE accounts (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'COURANT' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE INDEX idx_accounts_username ON accounts(username);

-- 10. Beneficiaries (Digital Banking Support)
CREATE TABLE beneficiaries (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    beneficiary_account VARCHAR(100) NOT NULL,
    alias VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE INDEX idx_beneficiaries_username ON beneficiaries(username);

-- 11. Approval Requests (Workflows)
CREATE TABLE approval_requests (
    id SERIAL PRIMARY KEY,
    initiator VARCHAR(100) NOT NULL,
    approver VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (initiator) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (approver) REFERENCES users(username) ON DELETE CASCADE
);
CREATE INDEX idx_approval_requests_approver ON approval_requests(approver);

-- 12. Open Banking API Credentials
CREATE TABLE api_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    client_id VARCHAR(100) UNIQUE NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE INDEX idx_api_cred_client_id ON api_credentials(client_id);

-- 13. Webhook Subscriptions (B2B)
CREATE TABLE webhook_subscriptions (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    target_url TEXT NOT NULL,
    secret_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
