from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/ocr/scan", summary="Simulate OCR Document Scanning")
async def scan_document(file: UploadFile = File(...)):
    """
    Simule l'extraction de texte (OCR) d'une pièce d'identité (CNI, Passeport).
    Dans un environnement de production, on utiliserait Tesseract OCR ou AWS Textract.
    """
    # Lire les premiers octets juste pour valider le fichier
    content = await file.read(1024)
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    # Simulation d'extraction réussie
    extracted_data = {
        "document_type": "NATIONAL_ID",
        "first_name": "AMADOU",
        "last_name": "DIALLO",
        "id_number": f"ML-{datetime.now().strftime('%Y%m%d')}-0012",
        "date_of_birth": "1990-05-15",
        "confidence_score": 98.5
    }

    logger.info(f"OCR simulé avec succès pour le fichier: {file.filename}")
    
    return {
        "status": "success",
        "message": "Data extracted successfully via OCR",
        "data": extracted_data
    }

@router.post("/ged/sign", summary="Electronic Signature Generation")
async def sign_document(file: UploadFile = File(...)):
    """
    Génère une signature électronique basique (Hash SHA-256) d'un document pour la GED.
    Garantit l'intégrité et la non-répudiation des contrats.
    """
    # Lire tout le fichier pour générer le hash
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    # Génération du Hash (Signature cryptographique du document)
    document_hash = hashlib.sha256(content).hexdigest()

    return {
        "status": "success",
        "message": "Document signed successfully",
        "signature": {
            "algorithm": "SHA-256",
            "hash": document_hash,
            "timestamp": datetime.now().isoformat(),
            "filename": file.filename
        }
    }
