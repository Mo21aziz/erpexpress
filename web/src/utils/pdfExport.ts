import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BonDeCommande } from "@/api/bon-de-commande";

export const exportBonDeCommandeToPDF = (bonDeCommande: BonDeCommande) => {
  const doc = new jsPDF("landscape", "mm", "a4");
  doc.setFont("helvetica");

  const pageWidth = 297;
  const margin = 10;

  const targetDate = new Date(bonDeCommande.target_date).toLocaleDateString(
    "fr-FR"
  );
  doc.setFontSize(10);
  doc.text(
    `Date (pour le): ${targetDate}`,
    pageWidth - margin - 50,
    margin + 8
  );

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Bon de Commande", margin, margin + 15);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Créé par:", margin, margin + 25);
  doc.setFont("helvetica", "normal");
  doc.text(
    bonDeCommande.employee?.user?.username || "Utilisateur inconnu",
    margin + 25,
    margin + 25
  );

  const sortedCategories = [...bonDeCommande.categories].sort((a, b) => {
    const aType = a.article?.type || "catering";
    const bType = b.article?.type || "catering";
    if (aType === "catering" && bType === "sonodis") return -1;
    if (aType === "sonodis" && bType === "catering") return 1;
    return 0;
  });

  const headers = [["Colisage", "Article", "Stock", "Demande", "Livraison"]];
  const body = sortedCategories.map((category) => [
    String(category.article?.collisage || "N/A"),
    String(category.article?.name || "Article inconnu"),
    String(category.quantite_a_stocker || 0),
    String(category.quantite_a_demander || 0),
    "",
  ]);

  const tableHeight = margin + 35;

  autoTable(doc, {
    head: headers,
    body: body,
    startY: tableHeight,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      minCellHeight: 6,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 70 },
      2: { cellWidth: 15 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
    },
    theme: "grid",
    tableWidth: "wrap",
    pageBreak: "avoid",
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
    showHead: "firstPage",
  });

  const finalY = (doc as any).lastAutoTable.finalY || margin + 120;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Nom et Prénom:", margin, finalY + 12);
  doc.text("Signature:", pageWidth / 2, finalY + 12);

  doc.setDrawColor(0);
  doc.line(margin, finalY + 15, margin + 60, finalY + 15);
  doc.line(pageWidth / 2, finalY + 15, pageWidth / 2 + 60, finalY + 15);

  const fileName = `bon_de_commande_${bonDeCommande.code}_${targetDate.replace(
    /\//g,
    "-"
  )}.pdf`;
  doc.save(fileName);
};
