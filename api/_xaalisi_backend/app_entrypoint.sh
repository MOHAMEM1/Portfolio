#!/bin/bash
echo "Démarrage du conteneur XAALISI..."

echo "En attente de l'initialisation de PostgreSQL (5s)..."
sleep 5

echo "Exécution des Migrations de Base de données (Alembic)..."
alembic upgrade head

echo "Lancement du serveur Uvicorn..."
exec uvicorn server:app --host 0.0.0.0 --port 8000
