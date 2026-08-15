from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from dependencies import get_current_user
from pydantic import BaseModel
import time

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

@router.post("/chat")
def chat_with_bot(req: ChatMessage, current_user: User = Depends(get_current_user)):
    """
    Assistant IA Bancaire XAALISI - Répond intelligemment aux questions financières.
    """
    time.sleep(0.8)  # Simuler la réflexion de l'IA
    
    user_msg = req.message.lower().strip()
    reply = ""

    # === SALUTATIONS ===
    if any(word in user_msg for word in ["bonjour", "salut", "coucou", "hello", "salam", "bonsoir", "hey", "yo"]):
        reply = f"Bonjour {current_user.username}. Je suis l'assistant IA de XAALISI Bank. Je peux vous accompagner dans la gestion de votre compte (solde, transferts, cartes, chéquiers, KYC). Que puis-je faire pour vous aujourd'hui ?"

    # === SOLDE & COMPTE ===
    elif any(word in user_msg for word in ["solde", "balance", "combien", "montant", "argent", "avoir", "compte", "disponible"]):
        reply = f"Votre solde est consultable en temps réel sur votre tableau de bord. Pour des raisons de confidentialité et de sécurité, je ne suis pas habilité à afficher le montant exact dans cet espace. Puis-je vous aider pour autre chose, {current_user.username} ?"

    # === TRANSFERTS & ENVOIS ===
    elif any(word in user_msg for word in ["verser", "envoyer", "transfert", "virement", "payer", "envoi", "recevoir", "transferer"]):
        reply = "Pour effectuer un transfert d'argent :\n\n1. Rendez-vous dans l'onglet 'Transfert' ou 'Paiements'.\n2. Choisissez le type de transfert (XAALISI, Interbancaire, International).\n3. Saisissez le montant et les coordonnées du bénéficiaire.\n4. Validez l'opération avec votre code PIN personnel.\n\nNote : Les transferts entre comptes XAALISI sont exécutés instantanément."

    # === CARTES BANCAIRES ===
    elif any(word in user_msg for word in ["carte", "card", "bloqu", "perdu", "vol", "visa", "virtuelle", "physique"]):
        reply = "Gestion de vos cartes bancaires :\n\n• Création : Accédez à l'onglet 'Cartes' puis 'Ajouter une carte'.\n• Opposition/Suspension : Utilisez le bouton 'Bloquer' directement sur l'interface de la carte concernée.\n• Consultation : Sélectionnez 'Afficher' pour voir les détails sécurisés.\n\nLa carte virtuelle est idéale pour vos achats en ligne, tandis que la carte physique vous sera délivrée en agence sous 5 à 7 jours ouvrés."

    # === CHÈQUES ===
    elif any(word in user_msg for word in ["cheque", "chèque", "chequier", "chéquier", "opposition"]):
        reply = "Services liés aux chéquiers :\n\n• Demande : Naviguez vers Menu > Chèques > Demander.\n• Opposition : Naviguez vers Menu > Chèques > Opposition.\n• Formats : Disponibles en carnets de 25, 50 ou 100 pages.\n\nLe délai de mise à disposition en agence est estimé entre 5 et 7 jours ouvrés."

    # === KYC & VÉRIFICATION ===
    elif any(word in user_msg for word in ["kyc", "plafond", "limite", "identite", "verification", "vérification", "identité", "tier", "niveau"]):
        reply = "Niveaux de vérification et plafonds (KYC) :\n\n• Niveau 1 (Standard) : Plafond de 100 000 FCFA/jour.\n• Niveau 2 (Vérifié) : Plafond de 500 000 FCFA/jour (nécessite une pièce d'identité).\n• Niveau 3 (Premium) : Plafond illimité (vérification approfondie).\n\nPour augmenter votre plafond, veuillez soumettre votre pièce d'identité via Menu > Statut KYC."

    # === CODE PIN & SÉCURITÉ ===
    elif any(word in user_msg for word in ["pin", "mot de passe", "code", "oublie", "oublié", "changer", "modifier", "sécurité", "securite"]):
        reply = "Sécurité et authentification :\n\n• Modification du PIN : Menu > Paramètres > Modifier le code PIN.\n• Biométrie : Menu > Paramètres > Activer FaceID/Empreinte digitale.\n• Réinitialisation : Utilisez l'option 'Mot de passe oublié' sur l'écran de connexion.\n\nRappel de sécurité : Ne communiquez jamais votre code PIN ou vos codes OTP, même à un agent XAALISI."

    # === FACTURES & PAIEMENTS ===
    elif any(word in user_msg for word in ["facture", "recu", "reçu", "historique", "releve", "relevé", "electricite", "eau", "telecom", "orange", "malitel"]):
        reply = "Paiements de factures et historique :\n\n• Règlement de factures : Onglet Paiements > Factures (SOMAGEP, EDM, Télécoms).\n• Historique des transactions : Accessible depuis la section 'Historique'.\n• Relevés bancaires : Disponibles en téléchargement via Menu > Relevés."

    # === TONTINES ===
    elif any(word in user_msg for word in ["tontine", "groupe", "epargne", "épargne", "cotisation"]):
        reply = "Tontines numériques XAALISI :\n\nCe service vous permet de gérer vos épargnes de groupe en toute transparence.\n• Création : Menu > Tontines > Nouveau groupe.\n• Adhésion : Rejoignez un groupe via un code d'invitation.\nLes prélèvements sont automatisés et l'historique est accessible à tous les membres."

    # === MARCHAND / POS ===
    elif any(word in user_msg for word in ["marchand", "merchant", "pos", "commerçant", "commercant", "boutique", "nfc", "paiement"]):
        reply = "Solutions Marchand (SoftPOS) :\n\nLe mode marchand vous permet de transformer votre appareil en terminal de paiement.\n• Encaissement sans contact (NFC).\n• Émission de factures numériques.\n• Suivi des encaissements en temps réel.\n\nActivation requise depuis Menu > Marchand."

    # === DIASPORA ===
    elif any(word in user_msg for word in ["diaspora", "international", "etranger", "étranger", "euro", "dollar", "devise", "taux", "change"]):
        reply = "Services Diaspora et International :\n\nXAALISI facilite les transferts internationaux vers le Mali.\n• Réception de fonds depuis l'international.\n• Conversion automatique avec un taux de change actualisé en temps réel.\n• Commission transparente (1.5% en moyenne).\nUne notification est émise dès la réception des fonds."

    # === SUPPORT & AIDE ===
    elif any(word in user_msg for word in ["aide", "help", "support", "probleme", "problème", "bug", "erreur", "marche pas", "contact", "conseiller"]):
        reply = "Assistance technique et service client :\n\n• Messagerie : Menu > Aide & Support > Ouvrir un ticket.\n• Téléphone : +223 20 XX XX XX (Du lundi au vendredi, de 8h à 18h).\n• Courriel : support@xaalisi.ml\n\nVeuillez décrire votre requête afin que nous puissions vous assister efficacement."

    # === FRAIS & TARIFS ===
    elif any(word in user_msg for word in ["frais", "tarif", "cout", "coût", "prix", "commission", "gratuit"]):
        reply = "Aperçu de la grille tarifaire :\n\n• Transferts internes (XAALISI) : Gratuits.\n• Virements interbancaires : 0.5%.\n• Transferts internationaux : 1.5%.\n• Carte virtuelle : Gratuite.\n• Carte physique : 5 000 FCFA (Frais d'émission).\n• Retraits sur GAB partenaires : 200 FCFA par opération."

    # === REMERCIEMENTS ===
    elif any(word in user_msg for word in ["merci", "chokran", "thanks", "thank", "super", "parfait", "genial", "génial", "excellent"]):
        reply = f"Je vous en prie, {current_user.username}. C'est un plaisir de vous assister. L'équipe XAALISI reste à votre entière disposition."

    # === AU REVOIR ===
    elif any(word in user_msg for word in ["au revoir", "bye", "bbye", "tchao", "ciao", "bonne nuit", "bonne journée"]):
        reply = f"Au revoir {current_user.username}. Nous vous souhaitons une excellente journée. L'assistance XAALISI reste disponible 24h/24."

    # === LANGUE ===
    elif any(word in user_msg for word in ["langue", "anglais", "français", "francais", "changer", "traduction", "language"]):
        reply = "Configuration linguistique :\n\nPour modifier la langue de l'application :\n1. Accédez au Menu principal.\n2. Sélectionnez 'Paramètres'.\n3. Modifiez la langue (Français ou Anglais)."

    # === QUI ES-TU ===
    elif any(word in user_msg for word in ["qui es tu", "qui es-tu", "c'est quoi", "xaalisi", "quel", "comment tu"]):
        reply = "Je suis l'assistant virtuel de XAALISI Bank.\n\nXAALISI est un établissement financier digital conçu pour simplifier les opérations bancaires au Mali et pour la diaspora. Je suis programmé pour répondre à vos interrogations concernant la gestion de vos comptes, vos transferts, vos moyens de paiement, ainsi que sur l'ensemble de nos services sécurisés."

    # === FALLBACK ===
    else:
        reply = f"Je vous remercie pour votre message, {current_user.username}.\n\nPour m'aider à mieux vous orienter, pourriez-vous reformuler votre demande ? Je suis qualifié pour vous renseigner sur les sujets suivants :\n• Gestion de compte et soldes\n• Transferts et paiements\n• Cartes bancaires et chéquiers\n• Plafonds et vérifications (KYC)\n• Assistance et sécurité"

    return {
        "reply": reply,
        "is_bot": True,
        "timestamp": time.time()
    }
