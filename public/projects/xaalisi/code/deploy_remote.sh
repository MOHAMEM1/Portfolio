#!/bin/bash
set -e

echo "Updating system..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "Setting up repository..."
if [ ! -d "xaalisi-monorepo" ]; then
  git clone https://github.com/XAALISI-Platform/xaalisi-monorepo.git
else
  cd xaalisi-monorepo
  git pull origin main
  cd ..
fi

cd xaalisi-monorepo

echo "Configuring environment variables..."
cat <<EOF > backend-core/.env
# Database Settings
DATABASE_URL=sqlite:///./database/xaalisi.db

# JWT Authentication
SECRET_KEY=supersecretkey_for_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://20.199.122.187,http://localhost:5173,http://localhost:8081
EOF

cat <<EOF > frontend-web/.env
VITE_API_URL=http://20.199.122.187/api
EOF

echo "Deploying with Docker Compose..."
sudo docker compose -f docker-compose.prod.yml up -d --build
echo "Deployment successful!"
