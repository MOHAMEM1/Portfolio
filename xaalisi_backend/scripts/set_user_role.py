import sys
import os

# Add the parent directory to sys.path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from database.models import User, RoleEnum

def set_user_role(username: str, role: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"[-] Erreur: Utilisateur '{username}' introuvable.")
            return

        role_upper = role.upper()
        valid_roles = [r.value for r in RoleEnum]
        
        if role_upper not in valid_roles:
            print(f"[-] Erreur: Rôle invalide. Rôles valides: {valid_roles}")
            return

        user.role = role_upper
        db.commit()
        print(f"[+] Succès: Le rôle de l'utilisateur '{username}' a été mis à jour vers '{role_upper}'.")
    except Exception as e:
        print(f"[-] Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python set_user_role.py <username> <ROLE>")
        print("Exemple: python set_user_role.py 0666555444 ADMIN")
        sys.exit(1)

    username_arg = sys.argv[1]
    role_arg = sys.argv[2]
    
    set_user_role(username_arg, role_arg)
