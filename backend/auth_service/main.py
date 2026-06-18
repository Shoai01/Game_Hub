from contextlib import asynccontextmanager
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.db import engine, Base
from auth_service.models.user import User  # Import to register in Base.metadata
from auth_service.api.v1.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (simple bootstrap)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully.")
    except Exception as e:
        print(f"Database connection / table creation failed on startup: {e}")
        print("Please check your database credentials in .env")
    yield

app = FastAPI(
    title="GameHub Auth Service",
    description="Microservice for User Authentication and Session Management",
    version="1.0.0",
    lifespan=lifespan
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
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"status": "ok", "service": "GameHub Auth Service"}
