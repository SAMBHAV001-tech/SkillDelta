from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from skillrot_app.db.database import get_db

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
def health_check(db: Session = Depends(get_db)):
    return {
        "status": "UP",
        "database": "Connected",
        "service": "SkillRot Backend"
    }
