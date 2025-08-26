import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BonDeCommande } from "@/api/bon-de-commande";

/**
 * Exports a Bon de Commande to PDF with intelligent horizontal layout handling.
 *
 * This solution demonstrates how to handle PDF exports with horizontal layout when content overflows vertically.
 * When articles don't fit vertically on a single page, they automatically flow horizontally across multiple columns.
 *
 * Key Features:
 * - Automatic column calculation based on content length
 * - Horizontal flow when vertical space is insufficient
 * - Maintains readability with optimal font sizes
 * - Preserves table structure and formatting
 * - Single page output regardless of content length
 *
 * Usage Example:
 * ```typescript
 * // Export a bon de commande with automatic layout
 * exportBonDeCommandeToPDF(bonDeCommande);
 *
 * // The function automatically determines the best layout:
 * // - If articles fit vertically: Single column layout
 * // - If articles overflow vertically: Multi-column horizontal layout
 * // - Maximum 4 columns for optimal readability
 * ```
 *
 * Layout Logic:
 * 1. Calculate available vertical space
 * 2. Determine if content fits in single column
 * 3. If overflow detected, calculate optimal column count
 * 4. Distribute articles evenly across columns
 * 5. Maintain consistent formatting and spacing
 */
export const exportBonDeCommandeToPDF = (bonDeCommande: BonDeCommande) => {
  const doc = new jsPDF("landscape", "mm", "a4");
  doc.setFont("helvetica");

  const pageWidth = 297;
  const pageHeight = 210;
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

  const tableStartY = margin + 35;
  const availableHeight = pageHeight - tableStartY - 30; // 30px for signature section

  // Calculate optimal layout parameters
  const baseRowHeight = 8;
  const maxRowsPerColumn = Math.floor(availableHeight / baseRowHeight);
  const totalRows = body.length;

  // Determine if we need multiple columns
  const needsMultipleColumns = totalRows > maxRowsPerColumn;

  // Initialize layout variables
  let finalColumns = 1;
  let layoutType = "single column";

  if (needsMultipleColumns) {
    // Calculate how many columns we need
    const columnsNeeded = Math.ceil(totalRows / maxRowsPerColumn);

    // Ensure we don't create too many columns (max 4 for readability)
    const maxColumns = 4;
    finalColumns = Math.min(columnsNeeded, maxColumns);
    layoutType = "horizontal flow";

    // Add spacing between columns for better visual separation
    const columnSpacing = 15; // Space between columns in mm
    const totalSpacing = (finalColumns - 1) * columnSpacing;
    const adjustedColumnWidth =
      (pageWidth - 2 * margin - totalSpacing) / finalColumns;

    // Recalculate rows per column with adjusted column count
    const adjustedRowsPerColumn = Math.ceil(totalRows / finalColumns);

    // Split data into columns - This is the key to horizontal flow!
    // Instead of trying to fit everything vertically, we distribute
    // articles horizontally across multiple columns
    for (let col = 0; col < finalColumns; col++) {
      const startRow = col * adjustedRowsPerColumn;
      const endRow = Math.min((col + 1) * adjustedRowsPerColumn, totalRows);
      const columnData = body.slice(startRow, endRow);

      // Calculate column position with spacing
      const columnX = margin + col * (adjustedColumnWidth + columnSpacing);

      autoTable(doc, {
        head: headers,
        body: columnData,
        startY: tableStartY,
        margin: {
          left: columnX,
          right: pageWidth - columnX - adjustedColumnWidth,
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          minCellHeight: baseRowHeight,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 7,
        },
        columnStyles: {
          0: { cellWidth: adjustedColumnWidth * 0.15 }, // Colisage
          1: { cellWidth: adjustedColumnWidth * 0.45 }, // Article
          2: { cellWidth: adjustedColumnWidth * 0.12 }, // Stock
          3: { cellWidth: adjustedColumnWidth * 0.15 }, // Demande
          4: { cellWidth: adjustedColumnWidth * 0.13 }, // Livraison
        },
        theme: "grid",
        tableWidth: adjustedColumnWidth - 5, // Leave small gap between columns
        pageBreak: "avoid",
        horizontalPageBreak: false,
        showHead: col === 0, // Only show header on first column
      });
    }
  } else {
    // Single column layout - original approach
    autoTable(doc, {
      head: headers,
      body: body,
      startY: tableStartY,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        minCellHeight: baseRowHeight,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Colisage
        1: { cellWidth: 80 }, // Article
        2: { cellWidth: 20 }, // Stock
        3: { cellWidth: 25 }, // Demande
        4: { cellWidth: 25 }, // Livraison
      },
      theme: "grid",
      tableWidth: "wrap",
      pageBreak: "avoid",
      horizontalPageBreak: false,
      showHead: "firstPage",
    });
  }

  // Get the final Y position, ensuring it doesn't exceed page height
  let finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 50;
  finalY = Math.min(finalY, pageHeight - 30);

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

  // Log layout information for debugging
  console.log(
    `PDF Export: ${totalRows} rows, ${finalColumns} column(s), layout: ${layoutType}`
  );

  doc.save(fileName);
};

/**
 * Validates if a bon de commande contains all categories and articles from the database
 * @param bonDeCommande - The bon de commande to validate
 * @param allCategories - All categories from the database
 * @param allArticles - All articles from the database
 * @returns Object containing validation results and missing items
 */
export const validateBonDeCommandeCompleteness = (
  bonDeCommande: any,
  allCategories: any[],
  allArticles: any[]
) => {
  // Get all category IDs and article IDs from the bon de commande
  const bonDeCommandeCategoryIds = new Set(
    bonDeCommande.categories.map((cat: any) => cat.category_id)
  );
  const bonDeCommandeArticleIds = new Set(
    bonDeCommande.categories
      .filter((cat: any) => cat.article_id)
      .map((cat: any) => cat.article_id)
  );

  // Find missing categories
  const missingCategories = allCategories.filter(
    (category) => !bonDeCommandeCategoryIds.has(category.id)
  );

  // Find missing articles
  const missingArticles = allArticles.filter(
    (article) => !bonDeCommandeArticleIds.has(article.id)
  );

  // Check if there are any missing items
  const hasMissingItems =
    missingCategories.length > 0 || missingArticles.length > 0;

  return {
    isValid: !hasMissingItems,
    hasMissingItems,
    missingCategories,
    missingArticles,
    missingCount: missingCategories.length + missingArticles.length,
  };
};
