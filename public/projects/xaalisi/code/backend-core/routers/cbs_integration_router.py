from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any
import xml.etree.ElementTree as ET
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Modèles de simulation ---
class SoapRequestModel(BaseModel):
    action: str
    payload: Dict[str, Any]

@router.post("/iso20022/pain-001", summary="Process ISO 20022 PAIN.001 Credit Transfer")
async def process_pain_001(request: Request):
    """
    Simule la réception d'un fichier XML ISO 20022 (PAIN.001 - Customer Credit Transfer Initiation).
    Cette route s'attend à recevoir du text/xml brut.
    """
    body_bytes = await request.body()
    try:
        xml_string = body_bytes.decode("utf-8")
        if not xml_string:
            raise ValueError("Empty XML")
        
        # Simulation d'un parsing XML (Très basique pour l'exemple)
        # Dans un vrai scénario, on parserait le Document/CstmrCdtTrfInitn/GrpHdr/MsgId etc.
        try:
            root = ET.fromstring(xml_string)
            # Juste pour s'assurer que c'est du XML valide
            element_count = len(list(root.iter()))
        except ET.ParseError:
            raise ValueError("Invalid XML format")

        # Simuler un traitement réussi (Acceptation technique - PAIN.002)
        response_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.03">
            <CstmrPmtStsRpt>
                <GrpHdr>
                    <MsgId>XAALISI-{datetime.now().strftime('%Y%m%d%H%M%S')}</MsgId>
                    <CreDtTm>{datetime.now().isoformat()}</CreDtTm>
                </GrpHdr>
                <OrgnlGrpInfAndSts>
                    <GrpSts>ACCP</GrpSts>
                </OrgnlGrpInfAndSts>
            </CstmrPmtStsRpt>
        </Document>"""

        return {"status": "success", "message": "PAIN.001 processed successfully", "pain002_response": response_xml}

    except Exception as e:
        logger.error(f"Erreur lors du traitement PAIN.001: {e}")
        raise HTTPException(status_code=400, detail="Invalid XML payload")

@router.post("/soap/sync", summary="Simulate SOAP Connector to CBS")
async def simulate_soap_connector(data: SoapRequestModel):
    """
    Simule un connecteur SOAP pour la synchronisation temps réel avec un Core Banking existant.
    """
    # Simuler une réponse d'un backend SOAP (par exemple Amplitude ou Flexcube)
    logger.info(f"Synchronisation SOAP demandée: {data.action}")
    
    return {
        "soap_env": "Envelope",
        "status": "SUCCESS",
        "cbs_reference": f"CBS-{datetime.now().timestamp()}",
        "action_executed": data.action
    }
