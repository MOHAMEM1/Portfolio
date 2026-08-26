from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import base64
import random
import time

from dependencies import get_current_user
from database.models import User

router = APIRouter(prefix="/kyc", tags=["KYC & AI OCR"])

class OCRRequest(BaseModel):
    image_base64: str

class OCRResponse(BaseModel):
    success: bool
    extracted_data: Optional[dict]
    message: str

@router.post("/ocr", response_model=OCRResponse)
def simulate_ocr_extraction(request: OCRRequest, current_user: User = Depends(get_current_user)):
    """
    Simule l'extraction de données via une IA (OCR) à partir d'une pièce d'identité.
    Dans un environnement de production réel, ceci appellerait pytesseract ou AWS Textract.
    """
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="Aucune image fournie.")

    # Simuler le temps de traitement de l'IA (1.5 secondes)
    time.sleep(1.5)
    
    # Validation factice basée sur la longueur de la chaîne base64
    if len(request.image_base64) < 100:
        return OCRResponse(
            success=False,
            extracted_data=None,
            message="Image trop petite ou illisible. Veuillez réessayer."
        )

    # Générer des données factices basées sur le profil de l'utilisateur pour simuler une lecture réussie
    # En réalité, on lirait l'image. Ici on crée un faux résultat réaliste.
    mock_id_number = f"ML-{random.randint(1000000, 9999999)}"
    
    extracted = {
        "document_type": "CARTE_NATIONALE_IDENTITE",
        "first_name": current_user.username.capitalize(),
        "last_name": "DIAWARA", # Faux nom de famille pour l'exemple
        "id_number": mock_id_number,
        "date_of_birth": "1990-05-14",
        "expiration_date": "2030-01-01",
        "confidence_score": 0.94 # Simule que l'IA est sûre à 94%
    }
    
    return OCRResponse(
        success=True,
        extracted_data=extracted,
        message="Données extraites avec succès par l'IA."
    )
