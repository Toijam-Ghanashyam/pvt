from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_encroachment_pdf(plot_id, owner_name, tax_id, reg_area, gis_area, discrepancy, iou, confidence, conflict_type):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=12
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4B5563'),
        spaceAfter=20
    )
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#111827'),
        spaceBefore=12,
        spaceAfter=8
    )

    # Document Header
    story.append(Paragraph("NAKSHA GeoAI Governance Platform", title_style))
    story.append(Paragraph(f"Official Spatial Audit & Encroachment Notice — Plot ID: {plot_id}", subtitle_style))
    story.append(Spacer(1, 10))

    # Table 1: Property & Ownership Details
    story.append(Paragraph("1. Revenue & Property Summary", section_style))
    prop_data = [
        ["Property Field", "Details"],
        ["Plot Identifier", str(plot_id)],
        ["Legal Deed Owner", str(owner_name)],
        ["Property Tax ID", str(tax_id)],
        ["Registered Area (Deed)", f"{reg_area:,.2f} m²"],
        ["GIS Surveyed Area", f"{gis_area:,.2f} m²"],
        ["Area Discrepancy", f"{discrepancy:+,.2f} m²"]
    ]
    t1 = Table(prop_data, colWidths=[200, 320])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(t1)
    story.append(Spacer(1, 15))

    # Table 2: AI Diagnostics & Conflict Metrics
    story.append(Paragraph("2. GeoAI Conflict Analysis", section_style))
    ai_data = [
        ["Diagnostic Metric", "Value / Assessment"],
        ["Conflict Classification", str(conflict_type)],
        ["AI Model Confidence", f"{confidence:.1f}%"],
        ["Intersection over Union (IoU)", f"{iou:.1f}%"],
        ["Audit Action Required", "Physical Field Verification Triggered" if iou > 30 else "Minor Border Adjustments"]
    ]
    t2 = Table(ai_data, colWidths=[200, 320])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#DC2626')),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(t2)
    story.append(Spacer(1, 20))

    # Legal Disclaimer / Signature Block
    story.append(Paragraph("Notice generated automatically by NAKSHA GeoAI Engine. Subject to physical ground-truthing verification.", subtitle_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()