from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.user import user_repo
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.auth import auth_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new user profile with hashed passwords."""
    existing = await user_repo.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists."
        )
    return await auth_service.register_user(db, user_in=user_in)


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Exchanges email credentials for an access token."""
    user = await auth_service.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    return auth_service.generate_tokens(user)


@router.post("/google", response_model=Token)
async def google_auth(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    """Mock verification of a Google OAuth2 ID Token and automatic profile creation."""
    email = payload.get("email")
    name = payload.get("name")
    if not email or not name:
        raise HTTPException(
            status_code=400,
            detail="Invalid Google Auth Payload"
        )
    # Register/retrieve Google User
    user = await auth_service.register_oauth_user(
        db, email=email, fullname=name, provider="google"
    )
    return auth_service.generate_tokens(user)


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile."""
    return current_user
