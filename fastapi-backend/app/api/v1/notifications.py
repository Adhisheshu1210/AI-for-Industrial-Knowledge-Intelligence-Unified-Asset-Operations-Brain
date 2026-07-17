from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class NotificationConnectionManager:
    """Manages active WebSocket channels to floor operator terminals."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_alert(self, message: str, severity: str = "INFO"):
        """Broadcasts a real-time safety, EHS, or maintenance warning."""
        payload = {
            "type": "alert",
            "message": message,
            "severity": severity, # INFO, WARNING, CRITICAL
        }
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                # Clean up stale websocket connections silently
                pass


manager = NotificationConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Floor operator WebSocket connection entrypoint."""
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection, handle client pings
            data = await websocket.receive_text()
            # Echo back keep-alive
            await websocket.send_json({"type": "pong", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
