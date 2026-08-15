import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      "nav": {
        "dashboard": "Tableau de bord",
        "history": "Historique",
        "transfer": "Envoyer",
        "bills": "Factures",
        "beneficiaries": "Bénéficiaires",
        "cards": "Cartes",
        "statements": "Relevés",
        "limits": "Limites KYC",
        "security": "Sécurité",
        "notifications": "Notifications",
        "support": "Support",
        "developer": "Portail Développeur",
        "admin": "Administration"
      },
      "dashboard": {
        "title": "Tableau de bord",
        "verified_wallet": "Portefeuille vérifié",
        "kyc_level": "KYC Niveau",
        "create_account": "Créer un Compte Épargne",
        "operations": {
          "title": "Opérations",
          "transfer": "Envoyer",
          "wallet": "Mon Wallet",
          "history": "Historique",
          "pay_bill": "Payer Facture"
        },
        "recent_activity": "Activité Récente",
        "see_all": "Voir tout",
        "no_activity": "Aucune transaction récente"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "history": "History",
        "transfer": "Transfer",
        "bills": "Pay Bills",
        "beneficiaries": "Beneficiaries",
        "cards": "Cards",
        "statements": "Statements",
        "limits": "KYC Limits",
        "security": "Security",
        "notifications": "Notifications",
        "support": "Support",
        "developer": "Developer Portal",
        "admin": "Administration"
      },
      "dashboard": {
        "title": "Dashboard",
        "verified_wallet": "Verified Wallet",
        "kyc_level": "KYC Level",
        "create_account": "Create Savings Account",
        "operations": {
          "title": "Operations",
          "transfer": "Transfer",
          "wallet": "My Wallet",
          "history": "History",
          "pay_bill": "Pay Bill"
        },
        "recent_activity": "Recent Activity",
        "see_all": "See all",
        "no_activity": "No recent transaction"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // default language
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
