# Guide de Déploiement : XAALISI sur Microsoft Azure 🚀

Ce document explique comment déployer l'infrastructure XAALISI en production sur une machine virtuelle (VM) Azure en utilisant Docker Compose.

## Prérequis
1. Un compte Microsoft Azure avec un abonnement actif (ou Student Plan).
2. Une Machine Virtuelle (VM) sous **Ubuntu 22.04 LTS** ou plus récent.
3. Les ports ouverts dans le pare-feu Azure (Network Security Group) :
   - `80` (HTTP - Nginx Gateway)
   - `443` (HTTPS - Si SSL configuré)
   - `22` (SSH - Pour l'administration)

## Étape 1 : Préparation de la VM
Connectez-vous à votre VM via SSH :
```bash
ssh azureuser@votre_adresse_ip_publique
```

Mettez à jour le système et installez Docker & Git :
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git docker.io docker-compose -y
sudo usermod -aG docker $USER
newgrp docker
```

## Étape 2 : Récupération du Code
Clonez le dépôt XAALISI sur votre VM :
```bash
git clone https://github.com/votre-organisation/xaalisi-monorepo.git
cd xaalisi-monorepo
```

## Étape 3 : Configuration des Variables d'Environnement
L'environnement de production exige des clés sécurisées. Modifiez le fichier `.env` à la racine (ou définissez ces variables au niveau de l'OS) :
```env
# Sécurité
SECRET_KEY=une_clé_très_longue_et_sécurisée_ici
ENCRYPTION_KEY=votre_clé_de_chiffrement_ici==
ENVIRONMENT=production

# Bases de données
DATABASE_URL=postgresql://admin:adminpassword@db:5432/xaalisi_db
REDIS_URL=redis://redis:6379/0

# Intégrations Tierces
ORANGE_MONEY_API_KEY=votre_clé_production_om
ORANGE_MONEY_SECRET=votre_secret_production_om
```

## Étape 4 : Lancement de l'Infrastructure
Grâce au fichier `docker-compose.yml` déjà présent, il suffit d'une seule commande pour démarrer toute l'architecture (Postgres, Redis, Backend, Nginx) :

```bash
docker-compose up -d --build
```

**Vérification :**
Vérifiez que tous les conteneurs tournent :
```bash
docker-compose ps
```

L'API est maintenant accessible publiquement via l'adresse IP de votre VM sur le port 80.

## Étape 5 : CI/CD Automatique (Optionnel)
Le dépôt contient déjà le fichier `.github/workflows/ci.yml`.
Pour activer le déploiement automatique sur Azure après chaque `push` sur la branche `main` :
1. Ajoutez les secrets de la VM (IP, SSH_KEY, USER) dans les "GitHub Secrets" de votre dépôt.
2. Ajoutez un job `deploy` dans `ci.yml` qui exécute un `git pull` et `docker-compose restart` sur la VM.
