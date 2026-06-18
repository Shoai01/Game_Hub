from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.db import engine, Base

# Import models to register them in Base.metadata
from auth_service.models.user import User  # noqa: F401
from room_service.models.room import Room, RoomPlayer  # noqa: F401
from room_service.models.message import Message  # noqa: F401
from room_service.api.v1.room import router as room_router
from room_service.api.v1.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Room Service: Database tables created successfully.")
    except Exception as e:
        print(f"Room Service: Database connection / table creation failed: {e}")
        print("Please check your database credentials in .env")
    yield


app = FastAPI(
    title="GameHub Room Service",
    description="Microservice for Game Room Management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(room_router, prefix="/api/v1/room", tags=["Room"])
app.include_router(chat_router, prefix="/api/v1/room", tags=["Chat"])


@app.get("/")
def read_root():
    return {"status": "ok", "service": "GameHub Room Service"}
