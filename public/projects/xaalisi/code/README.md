# 🏦 XAALISI — Plateforme FinTech & Mobile Money pour l'Afrique

> Solution complète de portefeuille numérique, de services bancaires et de paiements mobiles, pensée pour répondre aux besoins d'inclusion financière en Afrique.

---

## 📋 Table des Matières

- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Architecture Technique](#-architecture-technique)
- [Structure du Projet](#-structure-du-projet)
- [Installation & Déploiement](#-installation--déploiement)
- [Sécurité & Anti-Fraude](#-sécurité--anti-fraude)
- [Monitoring & DevOps](#-monitoring--devops)

---

## ✨ Fonctionnalités Clés

| Module | Description |
|--------|-------------|
| 💰 **Transferts P2P** | Envoi d'argent instantané avec système de frais dynamique et notifications temps réel |
| 💳 **Gestion des Cartes** | Cartes Visa virtuelles et physiques, blocage instantané, plafonds configurables |
| 🤖 **Assistant IA** | Chatbot intégré pour le support client et l'aide à la navigation |
| 💵 **Réseau d'Agents** | Dépôts et retraits géolocalisés via des agents partenaires avec système de notation |
| 📱 **Top-Up Mobile Money** | Intégration opérateurs (ex: Orange Money) via Cash-In et Webhooks |
| 🤝 **Tontine Digitale (Darét)** | Groupes d'épargne rotative avec gestion automatisée des cycles |
| 🏢 **B2B & Salaires** | Paiement de masse atomique (versement de salaires) |
| 💱 **Transferts Internationaux** | Réception de fonds de la diaspora (EUR → FCFA) |
| 📊 **Dashboard Back-Office** | Interface web complète pour la gestion des utilisateurs, KYC et KPIs |
| 🧾 **Reçus Cryptographiques** | Génération de reçus avec signature HMAC-SHA256 |

---

## 🏗 Architecture Technique

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │────▶│    Nginx     │────▶│   FastAPI    │
│  (React Nat) │     │  (Reverse    │     │  (Backend)   │
└──────────────┘     │    Proxy)    │     └──────┬───────┘
┌──────────────┐     │              │            │
│ Web Dashboard│────▶│  SSL/HTTPS   │            │
│   (React)    │     └──────────────┘            │
└──────────────┘                                 ▼
                                  ┌──────────┐ ┌──────────┐
                                  │PostgreSQL│ │  Redis   │
                                  │  (Data)  │ │ (Cache)  │
                                  └──────────┘ └──────────┘
```

**Stack Technologique :**
- **Backend** : Python 3.11, FastAPI, SQLAlchemy, Alembic
- **Frontend Mobile** : React Native, Expo, TypeScript
- **Frontend Web** : React, Vite, Tailwind CSS, TypeScript
- **Bases de données** : PostgreSQL (Production), SQLite (Dev), Redis (Cache & Anti-Fraude)
- **Déploiement** : Docker, Docker Compose, Nginx, Certbot (SSL)
- **Monitoring** : Prometheus, Grafana

---

## 📁 Structure du Projet

```
xaalisi-monorepo/
├── backend-core/           # API Principale (FastAPI)
│   ├── routers/            # Contrôleurs par domaine (Auth, Cards, CRM, Tontine, Webhooks...)
│   ├── database/           # Modèles de données (SQLAlchemy)
│   ├── ledger.py           # Moteur comptable en partie double
│   ├── fraud_engine.py     # Moteur anti-fraude (Velocity check)
│   └── tests/              # Suite de tests unitaires et d'intégration
├── frontend-mobile/        # Application Mobile (React Native / Expo)
│   ├── app/                # Écrans (Accueil, Cartes, Historique...)
│   └── components/         # Composants UI réutilisables
├── frontend-web/           # Dashboard Web d'Administration (React)
│   ├── src/pages/          # Pages (Dashboard, AI Chat, Utilisateurs...)
│   └── src/components/     # Composants d'interface
├── nginx/                  # Fichiers de configuration Nginx et certificats
└── docker-compose.prod.yml # Configuration d'orchestration pour la production
```

---

## 🚀 Installation & Déploiement

### Déploiement Production (Azure/VPS)

Le projet est packagé pour un déploiement simplifié via Docker.

```bash
# 1. Préparation de l'archive de déploiement
./deploy_zip.sh

# 2. Transfert vers le serveur de production (ex: Azure)
./deploy_remote.sh

# 3. Sur le serveur, lancement des services
docker compose -f docker-compose.prod.yml up -d --build
```

### Accès aux Services
- **API Backend** : `https://xaalisi.tech/api`
- **Dashboard Web** : `https://xaalisi.tech`
- **Application Mobile** : Compilée via `eas build` (Expo)

---

## 🔐 Sécurité & Anti-Fraude

L'architecture intègre des normes de sécurité bancaire strictes :
- **Authentification** : JWT (JSON Web Tokens) avec Blacklisting sur déconnexion.
- **Transactions** : Ledger à double entrée garantissant l'équilibre des comptes.
- **Race Conditions** : Verrous de ligne base de données (Row-Level Locking) contre le double-spending.
- **Idempotence** : Prévention des doublons de transactions réseaux.
- **Anti-Fraude** : Contrôle de vélocité via Redis (limitation des transactions suspectes).
- **Sécurité d'Infrastructure** : Nginx Rate Limiting (10 req/s), Security Headers (CSP, HSTS).
- **KYC** : Niveaux de vérification d'identité limitant les plafonds journaliers.

---

## 📈 Monitoring & DevOps

La plateforme intègre une stack de surveillance complète :
- **Prometheus** : Collecte des métriques backend (Temps de réponse, Taux d'erreur, CPU/RAM).
- **Grafana** : Tableaux de bord en temps réel pour l'équipe technique et métier.
- **CI/CD** : Intégration continue via GitHub Actions pour valider les tests avant chaque déploiement.
