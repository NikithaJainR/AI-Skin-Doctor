import { jsPDF } from "jspdf";
import { AssessmentReport } from "../types";

export function generateReportPDF(report: AssessmentReport) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Bar
  doc.setFillColor(15, 118, 110); // Teal header
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AI SKIN DOCTOR", 14, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Preliminary Educational Assessment Report", 14, 21);

  doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, pageWidth - 14, 14, {
    align: "right",
  });
  doc.text(`Report ID: #${report.id.slice(0, 8)}`, pageWidth - 14, 21, {
    align: "right",
  });

  y = 36;

  // Patient Info Card
  if (report.patientInfo) {
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, "F");

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Profile Summary", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const infoText = `Age/Gender: ${report.patientInfo.age || "N/A"} / ${
      report.patientInfo.gender || "N/A"
    } | Skin Type: ${report.patientInfo.skinType || "N/A"} | Duration: ${
      report.patientInfo.duration || "N/A"
    }`;
    doc.text(infoText, 18, y + 12);

    const symptomsText = `Symptoms: ${(report.patientInfo.symptoms || []).join(", ") || "None reported"}`;
    doc.text(symptomsText.slice(0, 85), 18, y + 17);

    y += 28;
  }

  // Assessment Banner
  doc.setFillColor(236, 253, 245); // Light emerald
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, "FD");

  doc.setTextColor(6, 95, 70);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Plausible Skin Condition:", 18, y + 8);

  doc.setFontSize(15);
  doc.setTextColor(4, 120, 87);
  doc.text(report.possible_condition.toUpperCase(), 18, y + 17);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(
    `Confidence: ${report.confidence_score}%  |  Severity Level: ${(report.severity || "moderate").toUpperCase()}`,
    pageWidth - 18,
    y + 17,
    { align: "right" }
  );

  y += 32;

  // Primary Image Preview if available
  if (report.primaryImage && report.primaryImage.startsWith("data:image")) {
    try {
      doc.addImage(report.primaryImage, "JPEG", 14, y, 45, 45);
      // Box text beside image
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text("Clinical Case Summary:", 64, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitSummary = doc.splitTextToSize(report.summary, pageWidth - 78);
      doc.text(splitSummary, 64, y + 12);

      y += 50;
    } catch (e) {
      y += 5;
    }
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Clinical Case Summary:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitSummary = doc.splitTextToSize(report.summary, pageWidth - 28);
    doc.text(splitSummary, 14, y + 6);
    y += splitSummary.length * 5 + 8;
  }

  // Key Sections
  const addListSection = (title: string, items: string[], maxCount = 4) => {
    if (!items || items.length === 0) return;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 118, 110);
    doc.text(title, 14, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);

    items.slice(0, maxCount).forEach((item) => {
      const split = doc.splitTextToSize(`• ${item}`, pageWidth - 32);
      doc.text(split, 18, y);
      y += split.length * 4.5;
    });
    y += 3;
  };

  addListSection("Visual Observations", report.visual_observations);
  addListSection("Recommended Home Care", report.recommended_home_care);
  addListSection("OTC Products & Active Ingredients", [
    ...report.recommended_otc_products,
    ...report.ingredients_to_look_for.map((i) => `Look for: ${i}`),
  ]);

  if (report.ingredients_to_avoid && report.ingredients_to_avoid.length > 0) {
    addListSection("Ingredients to Avoid", report.ingredients_to_avoid);
  }

  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // Doctor Visit Criteria
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28); // Red
  doc.text("When to See a Doctor / Emergency Red Flags:", 14, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27);
  const splitDoctor = doc.splitTextToSize(
    report.when_to_visit_doctor || "Consult a doctor if symptoms persist or worsen.",
    pageWidth - 28
  );
  doc.text(splitDoctor, 14, y);
  y += splitDoctor.length * 4 + 4;

  // Medical Disclaimer at Footer
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(14, 260, pageWidth - 28, 22, 2, 2, "FD");

  doc.setTextColor(153, 27, 27);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("CRITICAL MEDICAL DISCLAIMER:", 18, 265);

  doc.setFont("helvetica", "normal");
  const disclaimerMsg =
    "This AI-generated document is strictly for educational purposes and preliminary self-awareness. It does NOT constitute medical diagnosis, treatment advice, or formal prescription. Always seek the advice of a qualified board-certified dermatologist or healthcare provider with any skin concerns.";
  const splitDisclaimer = doc.splitTextToSize(disclaimerMsg, pageWidth - 36);
  doc.text(splitDisclaimer, 18, 269);

  doc.save(`Skin_Report_${report.possible_condition.replace(/\s+/g, "_")}_${report.id.slice(0, 6)}.pdf`);
}
