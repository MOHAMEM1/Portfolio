from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket_manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSockets Notifications"])

@router.websocket("/ws/notifications/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    """Canal ouvert via WebSockets pour envoyer les notifications aux clients en temps réel."""
    await manager.connect(websocket, username)
    try:
        while True:
            # Le frontend n'envoie rien dans cet exemple, mais la boucle doit rester ouverte
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(username)
    except Exception as e:
        logger.error(f"Erreur WebSocket : {e}")
        manager.disconnect(username)
