@echo off
echo Starting GameHub Microservices...

echo Starting Auth Service on port 8000...
start cmd /k ".\venv\Scripts\activate & uvicorn auth_service.main:app --port 8000 --reload"

echo Starting Room Service on port 8001...
start cmd /k ".\venv\Scripts\activate & uvicorn room_service.main:app --port 8001 --reload"

echo All services started!
