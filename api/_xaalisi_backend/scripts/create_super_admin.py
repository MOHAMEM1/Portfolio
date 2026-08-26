import os
import sys

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from database.database import SessionLocal
from database.models import User, RoleEnum
import auth

def create_super_admin():
    db = SessionLocal()
    try:
        username = "ROOT_ADMIN"
        # Check if exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"L'admin super {username} existe deja.")
            return

        pwd = "super_admin_secure_password123"
        pin = "0000"
        
        hashed_pwd = auth.get_password_hash(pwd)
        hashed_pin = auth.get_password_hash(pin)
        
        admin_user = User(
            username=username,
            hashed_password=hashed_pwd,
            pin_code=hashed_pin,
            role=RoleEnum.ADMIN.value,
            kyc_tier=2
        )
        
        db.add(admin_user)
        db.commit()
        print(f"Super Admin crée avec success! Username: {username} | Password: {pwd} | PIN: {pin}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
