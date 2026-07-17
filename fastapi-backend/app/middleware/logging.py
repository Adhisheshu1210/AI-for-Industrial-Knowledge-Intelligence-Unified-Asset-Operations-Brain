import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("fastapi_app")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request meta
        method = request.method
        url = request.url.path
        client_host = request.client.host if request.client else "unknown"
        
        try:
            response = await call_next(request)
            process_time = round((time.time() - start_time) * 1000, 2)
            
            # Log structured trace info
            logger.info(
                f"Host: {client_host} | HTTP: {method} {url} | Status: {response.status_code} | Duration: {process_time}ms"
            )
            
            # Inject latency header for API monitoring
            response.headers["X-Process-Time-Ms"] = str(process_time)
            return response
            
        except Exception as e:
            process_time = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"Unhandled Exception: {str(e)} | HTTP: {method} {url} | Duration: {process_time}ms"
            )
            raise e
