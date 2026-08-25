"""
Relevés de compte et export PDF.
CDC Complémentaire §1 — Téléchargement relevé PDF.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import io

from database.database import get_db
from database.models import Transaction, Entry, User
from dependencies import get_current_user

router = APIRouter(prefix="/statements", tags=["Statements & Exports"])


@router.get("/{account_id}")
def generate_statement(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Générer un relevé de compte au format JSON."""
    entries = db.query(Entry).filter(Entry.account_id == account_id).all()

    if not entries:
        return {"message": "No transactions found for this account."}

    statement_data = {
        "account_id": account_id,
        "owner": current_user.username,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "transactions": []
    }

    running_balance = 0.0
    for entry in entries:
        transaction = db.query(Transaction).filter(Transaction.id == entry.transaction_id).first()
        if entry.entry_type == "CREDIT":
            running_balance += entry.amount
        else:
            running_balance -= entry.amount

        statement_data["transactions"].append({
            "transaction_id": transaction.id,
            "date": transaction.timestamp.isoformat(),
            "amount": entry.amount,
            "type": entry.entry_type,
            "description": transaction.description or transaction.transaction_type,
            "status": transaction.status,
            "balance_after": round(running_balance, 2)
        })

    statement_data["final_balance"] = round(running_balance, 2)
    statement_data["total_transactions"] = len(statement_data["transactions"])
    return statement_data


@router.get("/{account_id}/pdf")
def generate_pdf_statement(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Télécharger le relevé de compte au format PDF."""
    entries = db.query(Entry).filter(Entry.account_id == account_id).all()

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
    except ImportError:
        return _generate_csv_fallback(account_id, entries, db, current_user.username)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("XAALISI - Releve de Compte", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Titulaire : {current_user.username}", styles["Normal"]))
    elements.append(Paragraph(f"Compte : {account_id}", styles["Normal"]))
    elements.append(Paragraph(f"Date : {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}", styles["Normal"]))
    elements.append(Spacer(1, 24))

    table_data = [["Date", "Description", "Debit", "Credit", "Solde"]]
    running_balance = 0.0

    for entry in entries:
        transaction = db.query(Transaction).filter(Transaction.id == entry.transaction_id).first()
        if entry.entry_type == "CREDIT":
            running_balance += entry.amount
            debit = ""
            credit = f"{entry.amount:,.0f}"
        else:
            running_balance -= entry.amount
            debit = f"{entry.amount:,.0f}"
            credit = ""

        table_data.append([
            transaction.timestamp.strftime("%d/%m/%Y") if transaction.timestamp else "-",
            (transaction.description or transaction.transaction_type)[:30],
            debit,
            credit,
            f"{running_balance:,.0f}"
        ])

    if len(table_data) > 1:
        table = Table(table_data, colWidths=[80, 180, 70, 70, 80])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.06, 0.09, 0.16)),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("TOPPADDING", (0, 0), (-1, 0), 10),
            ("BACKGROUND", (0, 1), (-1, -1), colors.Color(0.98, 0.98, 1.0)),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.96, 0.98)])
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("Aucune transaction trouvee pour ce compte.", styles["Normal"]))

    elements.append(Spacer(1, 24))
    elements.append(Paragraph(f"Solde final : {running_balance:,.0f} FCFA", styles["Heading2"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Ce document est genere automatiquement par la plateforme XAALISI.", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)

    filename = f"releve_xaalisi_{account_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


def _generate_csv_fallback(account_id, entries, db, username):
    """Fallback CSV si reportlab n'est pas disponible."""
    lines = ["Date,Description,Type,Montant,Solde"]
    running_balance = 0.0

    for entry in entries:
        transaction = db.query(Transaction).filter(Transaction.id == entry.transaction_id).first()
        if entry.entry_type == "CREDIT":
            running_balance += entry.amount
        else:
            running_balance -= entry.amount
        lines.append(
            f"{transaction.timestamp.isoformat()},{transaction.description or transaction.transaction_type},{entry.entry_type},{entry.amount},{running_balance}"
        )

    csv_content = "\n".join(lines)
    buffer = io.BytesIO(csv_content.encode("utf-8"))
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=releve_{account_id}.csv"}
    )
