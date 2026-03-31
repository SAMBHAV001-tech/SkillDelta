from fastapi import FastAPI
from skillrot_app.core.config import settings
from skillrot_app.core.logging import setup_logging
from skillrot_app.core.exceptions import global_exception_handler
from skillrot_app.core.scheduler import start_scheduler

import logging

# 🔹 Import routers in desired logical order

from skillrot_app.api.auth import router as auth_router
from skillrot_app.api.skills import router as skills_router
from skillrot_app.api.analysis import router as analysis_router
from skillrot_app.api.recommendations import router as recommendations_router
from skillrot_app.api.growth import router as growth_router
from skillrot_app.api.predict import router as predict_router
from skillrot_app.api.assessment import router as assessment_router
from skillrot_app.api.practice import router as practice_router
from skillrot_app.api.dashboard import router as dashboard_router
from skillrot_app.api.reminders import router as reminders_router
from skillrot_app.api.skill_history import router as skill_history_router
from skillrot_app.api.users import router as users_router
from skillrot_app.api.health import router as health_router
from skillrot_app.api.role_filter import router as role_filter_router

# 🔹 DB imports
from skillrot_app.db.database import check_db_connection, engine
from skillrot_app.models.base import Base

# 🔹 Import models for metadata registration
import skillrot_app.models.user
import skillrot_app.models.skill
import skillrot_app.models.skill_history
import skillrot_app.models.subtopic
import skillrot_app.models.skill_health_history
import skillrot_app.models.reminder

import os
from dotenv import load_dotenv

load_dotenv()

print("EMAIL LOADED:", os.getenv("EMAIL_ADDRESS"))

# 🔹 Setup logging FIRST
setup_logging()
logger = logging.getLogger(__name__)

# ✅ Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0"
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://skilldelta.netlify.app",      # if you host frontend
        "https://skilldelta.vercel.app",       # if hosted on vercel
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, global_exception_handler)

# =========================================================
# 🔥 ROUTER ORDER (STRICTLY AS REQUESTED)
# =========================================================

app.include_router(auth_router)            # 1️⃣ Auth
app.include_router(skills_router)          # 2️⃣ Skills
app.include_router(analysis_router)        # 3️⃣ Skill Analysis
app.include_router(recommendations_router) # 4️⃣ Recommendation
app.include_router(growth_router)          # 5️⃣ Growth Analytics
app.include_router(predict_router)         # 6️⃣ Prediction
app.include_router(assessment_router)      # 7️⃣ Assessment
app.include_router(practice_router)        # 8️⃣ Practice
app.include_router(dashboard_router)       # 9️⃣ Dashboard
app.include_router(reminders_router)       # 🔟 Reminder
app.include_router(skill_history_router)   # 11️⃣ Skill History
app.include_router(users_router)           # 12️⃣ User
app.include_router(health_router)          # 13️⃣ Health
app.include_router(role_filter_router)

# =========================================================
# 🔹 STARTUP / SHUTDOWN
# =========================================================

@app.on_event("startup")
def startup_event():
    logger.info("SkillDelta backend starting up...")
    check_db_connection()
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")
    start_scheduler()


@app.on_event("shutdown")
def shutdown_event():
    logger.info("SkillDelta backend shutting down...")


# =========================================================
# 🔹 DEFAULT ROOT ENDPOINT (LAST)
# =========================================================

@app.get("/")
def root():
    db_type = "Unknown DB"

    if "supabase" in settings.DATABASE_URL:
        db_type = "Supabase PostgreSQL"
    elif "render" in settings.DATABASE_URL:
        db_type = "Render PostgreSQL"
    elif "localhost" in settings.DATABASE_URL:
        db_type = "Local PostgreSQL"

    return {
        "message": "SkillDelta backend running",
        "database": db_type
    }
