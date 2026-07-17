from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User, UserRole
from app.repositories.user import user_repo
from app.schemas.user import UserCreate, Token


class AuthService:
    async def authenticate_user(
        self, db: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        user = await user_repo.get_by_email(db, email=email)
        if not user or not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            fullname=user_in.fullname,
            hashed_password=hashed_password,
            role=user_in.role,
        )
        return await user_repo.create(db, obj_in=db_user)

    async def register_oauth_user(
        self, db: AsyncSession, email: str, fullname: str, provider: str
    ) -> User:
        existing = await user_repo.get_by_email(db, email)
        if existing:
            return existing
        db_user = User(
            email=email,
            fullname=fullname,
            hashed_password=None,
            role=UserRole.OPERATOR,
            oauth_provider=provider,
        )
        return await user_repo.create(db, obj_in=db_user)

    def generate_tokens(self, user: User) -> Token:
        access_token = create_access_token(subject=user.email)
        return Token(
            access_token=access_token,
            token_type="bearer",
            role=user.role.value,
            fullname=user.fullname
        )


auth_service = AuthService()
