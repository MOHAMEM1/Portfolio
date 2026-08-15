#!/bin/bash
set -e

sudo apt-get install -y unzip

mkdir -p xaalisi-deploy
cd xaalisi-deploy
unzip -o ../deploy.zip

echo "Configuring environment variables..."
cat <<EOF > backend-core/.env
# Database Settings
DATABASE_URL=sqlite:///./database/xaalisi.db

# JWT Authentication
SECRET_KEY=supersecretkey_for_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://20.199.122.187,http://localhost:5173,http://localhost:8081,http://10.0.2.2:8000,http://127.0.0.1:8000
EOF

cat <<EOF > frontend-web/.env
VITE_API_URL=/api
EOF

echo "Deploying with Docker Compose..."
sudo docker compose -f docker-compose.prod.yml up -d --build
echo "Deployment successful!"
