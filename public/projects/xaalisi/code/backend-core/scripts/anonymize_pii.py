import sys
import os

# Add parent directory to path so we can import from database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from database.models import User
from sqlalchemy.orm import Session
import hashlib

def anonymize_user_pii(db: Session, user_id: int):
    """
    Anonymize Personally Identifiable Information (PII) for a specific user.
    Useful for GDPR/privacy compliance when a user deletes their account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"User with ID {user_id} not found.")
        return False

    # Check if already anonymized
    if user.username.startswith("anon_"):
        print(f"User {user_id} is already anonymized.")
        return True

    original_username = user.username
    
    # Generate an anonymous hash for the username to keep it unique
    anon_hash = hashlib.sha256(user.username.encode()).hexdigest()[:12]
    user.username = f"anon_{anon_hash}"
    
    # Clear out passwords and pins
    user.hashed_password = "DELETED_USER"
    user.pin_code = None
    
    # Clear KYC Data
    if user.kyc_doc_path:
        # In a real scenario, you would also delete the physical file
        try:
            if os.path.exists(user.kyc_doc_path):
                os.remove(user.kyc_doc_path)
                print(f"Deleted KYC document: {user.kyc_doc_path}")
        except Exception as e:
            print(f"Failed to delete KYC file: {e}")
        user.kyc_doc_path = None
    
    user.kyc_status = "ANONYMIZED"
    
    # Clear precise location data
    user.latitude = None
    user.longitude = None
    
    user.status = "DELETED"
    
    db.commit()
    print(f"Successfully anonymized PII for user ID {user_id} (formerly {original_username}).")
    return True

def anonymize_inactive_users(db: Session):
    """
    Find and anonymize users that have requested deletion or are marked DELETED.
    """
    users_to_anonymize = db.query(User).filter(User.status == "PENDING_DELETION").all()
    if not users_to_anonymize:
        print("No users pending deletion found.")
        return

    print(f"Found {len(users_to_anonymize)} users to anonymize.")
    for user in users_to_anonymize:
        anonymize_user_pii(db, user.id)

if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Starting PII Anonymization job...")
        anonymize_inactive_users(db)
        print("Job completed.")
    finally:
        db.close()
