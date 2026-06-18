from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from auth_service.models.user import User
from auth_service.schemas.user import UserCreate, UserUpdate
from core.security import get_password_hash

async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> User:
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> User:
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, db_user: User, user_update: UserUpdate) -> User:
    update_data = user_update.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_user, field, update_data[field])
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
