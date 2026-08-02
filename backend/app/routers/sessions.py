from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
import uuid

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("/", response_model=schemas.SessionOut)
def create_session(db: Session = Depends(get_db)):
    new_session = models.Session(id=str(uuid.uuid4()), title="New Chat")
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/", response_model=List[schemas.SessionSummary])
def get_all_sessions(db: Session = Depends(get_db)):
    sessions = db.query(models.Session).order_by(models.Session.created_at.desc()).all()
    return sessions

@router.get("/{session_id}", response_model=schemas.SessionOut)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = (
        db.query(models.Session)
        .options(joinedload(models.Session.messages))
        .filter(models.Session.id == session_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}