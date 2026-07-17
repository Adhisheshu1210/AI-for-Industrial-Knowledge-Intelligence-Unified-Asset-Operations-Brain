from typing import Optional
import json
import redis.asyncio as aioredis
from app.core.config import settings

class RedisCacheManager:
    def __init__(self):
        self.redis_client: Optional[aioredis.Redis] = None

    def connect(self):
        self.redis_client = aioredis.from_url(
            settings.cache_redis_url, 
            encoding="utf-8", 
            decode_responses=True
        )

    async def get(self, key: str) -> Optional[str]:
        if not self.redis_client:
            self.connect()
        try:
            return await self.redis_client.get(key)
        except Exception:
            return None

    async def set(self, key: str, value: str, expire_seconds: int = 3600) -> bool:
        if not self.redis_client:
            self.connect()
        try:
            await self.redis_client.set(key, value, ex=expire_seconds)
            return True
        except Exception:
            return False

    async def set_json(self, key: str, data: dict, expire_seconds: int = 3600) -> bool:
        return await self.set(key, json.dumps(data), expire_seconds)

    async def get_json(self, key: str) -> Optional[dict]:
        raw = await self.get(key)
        if not raw:
            return None
        try:
            return json.loads(raw)
        except Exception:
            return None

    async def delete(self, key: str) -> bool:
        if not self.redis_client:
            self.connect()
        try:
            await self.redis_client.delete(key)
            return True
        except Exception:
            return False

    async def close(self):
        if self.redis_client:
            await self.redis_client.close()


cache_manager = RedisCacheManager()
