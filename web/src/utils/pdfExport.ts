import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BonDeCommande } from "@/api/bon-de-commande";

export const exportBonDeCommandeToPDF = (bonDeCommande: BonDeCommande) => {
  const doc = new jsPDF("landscape", "mm", "a4");
  doc.setFont("helvetica");

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 6;

  const targetDate = new Date(bonDeCommande.target_date).toLocaleDateString(
    "fr-FR"
  );
  doc.setFontSize(8);
  doc.text(
    `Date (pour le): ${targetDate}`,
    pageWidth - margin - 40,
    margin + 5
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bon de Commande", margin, margin + 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Créé par:", margin, margin + 16);
  doc.setFont("helvetica", "normal");
  doc.text(
    bonDeCommande.employee?.user?.username || "Utilisateur inconnu",
    margin + 18,
    margin + 16
  );

const sortedCategories = [...bonDeCommande.categories].sort((a, b) => {
  const aType = (a.article?.type || "catering").toLowerCase();
  const bType = (b.article?.type || "catering").toLowerCase();

  // Order by type first: sonodis first, then catering
  if (aType !== bType) {
    if (aType === "sonodis") return -1;
    if (bType === "sonodis") return 1;
    return aType.localeCompare(bType);
  }

  // Within the same type, order by article numero (ascending)
  const aNumero = a.article?.numero ?? Number.MAX_SAFE_INTEGER;
  const bNumero = b.article?.numero ?? Number.MAX_SAFE_INTEGER;
  
  if (aNumero !== bNumero) {
    return aNumero - bNumero;
  }

  // If same numero, order by category name
  const aCat = (a.category?.name || "").toLowerCase();
  const bCat = (b.category?.name || "").toLowerCase();
  if (aCat !== bCat) return aCat.localeCompare(bCat);

  // Then by article name for consistent ordering
  const aName = (a.article?.name || "").toLowerCase();
  const bName = (b.article?.name || "").toLowerCase();
  return aName.localeCompare(bName);
});

  const headers = [["Colis", "Article", "Stock", "Dem", "Liv"]];
  const body = sortedCategories.map((category) => [
    String(category.article?.collisage || "N/A"),
    String(category.article?.name || "Article inconnu"),
    String(category.quantite_a_stocker || 0),
    String(category.quantite_a_demander || 0),
    "",
  ]);

  const tableStartY = margin + 22;

  // Calculate optimal layout parameters
  const baseRowHeight = 5;
  const totalRows = body.length;

  // Force exactly 2 columns
  const finalColumns = 2;

  // Add minimal spacing between columns
  const columnSpacing = 8;
  const totalSpacing = (finalColumns - 1) * columnSpacing;
  const adjustedColumnWidth =
    (pageWidth - 2 * margin - totalSpacing) / finalColumns;

  // Calculate rows per column
  const rowsPerColumn = Math.ceil(totalRows / finalColumns);

  // Create a single table with all data distributed in two columns
  const tableData = [];

  // Add header only to the first column, leave second column header empty
  const extendedHeaders = [
    [
      "Colis",
      "Article",
      "Stock",
      "Demande",
      "Livraison",
      "colis",
      "Article",
      "stock",
      "demande",
      "livraison",
    ],
  ];

  for (let i = 0; i < rowsPerColumn; i++) {
    const rowData = [];

    // Add data from first column
    if (i < body.length) {
      rowData.push(...body[i]);
    } else {
      rowData.push("", "", "", "", "");
    }

    // Add data from second column if exists
    if (i + rowsPerColumn < body.length) {
      rowData.push(...body[i + rowsPerColumn]);
    } else if (i < rowsPerColumn) {
      // Only add empty cells if we're in the first column's rows
      rowData.push("", "", "", "", "");
    }

    tableData.push(rowData);
  }

  // Create a custom draw function for styling
  const didDrawCell = (data: any) => {
    // Add a vertical line between columns for visual separation
    if (data.column.index === 4 && data.section === "body") {
      doc.setDrawColor(200, 200, 200);
      doc.line(
        data.cell.x + data.cell.width,
        data.cell.y,
        data.cell.x + data.cell.width,
        data.cell.y + data.cell.height
      );
    }

    // Apply light gray background to Stock columns (index 2 and 7) in body only
    if (
      (data.column.index === 2 || data.column.index === 7) &&
      data.section === "body"
    ) {
      doc.setFillColor(180, 180, 180);
      doc.rect(
        data.cell.x,
        data.cell.y,
        data.cell.width,
        data.cell.height,
        "F"
      );

      // Redraw the text after applying background
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(
        data.cell.text,
        data.cell.x + 1,
        data.cell.y + data.cell.height / 2 + 1.5
      );
    }
  };

  autoTable(doc, {
    head: extendedHeaders,
    body: tableData,
    startY: tableStartY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 0.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      minCellHeight: baseRowHeight,
      fontStyle: "bold",
      font: "helvetica",
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      fontStyle: "bold",
    },
    columnStyles: {
      // First column set
      0: { cellWidth: adjustedColumnWidth * 0.12 },
      1: { cellWidth: adjustedColumnWidth * 0.5 },
      2: { cellWidth: adjustedColumnWidth * 0.12 },
      3: { cellWidth: adjustedColumnWidth * 0.13 },
      4: { cellWidth: adjustedColumnWidth * 0.13 },

      // Second column set
      5: { cellWidth: adjustedColumnWidth * 0.12 },
      6: { cellWidth: adjustedColumnWidth * 0.5 },
      7: { cellWidth: adjustedColumnWidth * 0.12 },
      8: { cellWidth: adjustedColumnWidth * 0.13 },
      9: { cellWidth: adjustedColumnWidth * 0.13 },
    },
    theme: "grid",
    tableWidth: pageWidth - 2 * margin,
    pageBreak: "avoid",
    horizontalPageBreak: false,
    didDrawCell: didDrawCell,
  });

  const fileName = `bon_de_commande_${bonDeCommande.code}_${targetDate.replace(
    /\//g,
    "-"
  )}.pdf`;

  doc.save(fileName);
};

// Validate that a bon de commande contains all categories and articles from database
export const validateBonDeCommandeCompleteness = (
  bonDeCommande: BonDeCommande,
  allCategories: any[],
  allArticles: any[]
) => {
  const presentCategoryIds = new Set(
    bonDeCommande.categories.map((c) => c.category?.id).filter(Boolean)
  );
  const presentArticleIds = new Set(
    bonDeCommande.categories.map((c) => c.article?.id).filter(Boolean)
  );

  const missingCategories = (allCategories || []).filter(
    (cat: any) => cat && cat.id && !presentCategoryIds.has(cat.id)
  );

  const missingArticles = (allArticles || []).filter(
    (art: any) => art && art.id && !presentArticleIds.has(art.id)
  );

  return {
    hasMissingItems:
      (missingCategories && missingCategories.length > 0) ||
      (missingArticles && missingArticles.length > 0),
    missingCategories,
    missingArticles,
  };
};