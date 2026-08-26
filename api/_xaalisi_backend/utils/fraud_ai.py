import random
import time

def analyze_transaction_risk(sender_id: str, receiver_id: str, amount: float, time_of_day: str, ip_address: str) -> dict:
    """
    Simule un modèle de Machine Learning pour la détection de fraude.
    Dans un environnement de production, cela appellerait un modèle scikit-learn ou TensorFlow.
    """
    # Simulation de latence d'inférence
    time.sleep(0.1)
    
    risk_score = 0.0
    reasons = []

    # Règles heuristiques pour simuler le comportement du ML
    if amount > 500000:
        risk_score += 0.4
        reasons.append("Montant inhabituellement élevé")
        
    if time_of_day in ["01:00", "02:00", "03:00", "04:00"]:
        risk_score += 0.3
        reasons.append("Transaction effectuée tard dans la nuit")
        
    # Simulation d'adresse IP suspecte
    if ip_address.startswith("192.168.1.") and random.random() > 0.8:
        risk_score += 0.2
        reasons.append("Adresse IP associée à une région à haut risque")
        
    # Risque aléatoire de base (le modèle ML trouve des patterns cachés)
    base_risk = random.uniform(0.01, 0.15)
    risk_score += base_risk
    
    # Cap le score à 0.99
    risk_score = min(risk_score, 0.99)
    
    return {
        "risk_score": round(risk_score, 3),
        "is_fraudulent": risk_score > 0.75,
        "reasons": reasons if risk_score > 0.4 else [],
        "action_recommended": "BLOCK" if risk_score > 0.75 else ("FLAG_FOR_REVIEW" if risk_score > 0.5 else "APPROVE")
    }
