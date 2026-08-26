from fastapi import WebSocket
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Enregistre le nom d'utilisateur -> WebSocket actif
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket
        logger.info(f"WebSocket connecté - Client : {username}")

    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]
            logger.info(f"WebSocket déconnecté pour : {username}")

    async def send_personal_message(self, message: str, username: str):
        if username in self.active_connections:
            try:
                await self.active_connections[username].send_text(message)
            except Exception as e:
                logger.error(f"Échec de l'envoi du message WebSocket : {e}")

# Singleton global du gestionnaire de WebSockets
manager = ConnectionManager()
