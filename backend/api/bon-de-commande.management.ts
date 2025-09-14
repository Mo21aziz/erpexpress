import express, { Request, Response } from "express";
import container from "../lib/container";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// Create bon de commande
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  const startTime = Date.now();

  // Set headers to prevent connection reset
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=60");

  // Set a timeout for the response
  const responseTimeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("Response timeout - sending error response");
      res.status(500).json({ error: "Response timeout" });
    }
  }, 25000); // 25 seconds timeout

  try {
    console.log(
      `[${new Date().toISOString()}] Starting bon de commande operation`
    );

    const {
      description,
      employee_id,
      category_id,
      article_id,
      quantite_a_stocker,
      quantite_a_demander,
      article_name,
      target_date,
    } = req.body;

    // Validate required fields
    if (!category_id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    // Allow null values for quantite_a_stocker and quantite_a_demander
    // These will be handled by the frontend warning system
    if (quantite_a_stocker === undefined) {
      return res.status(400).json({ error: "Quantite a stocker is required" });
    }

    if (quantite_a_demander === undefined) {
      return res.status(400).json({ error: "Quantite a demander is required" });
    }

    if (!article_id) {
      return res.status(400).json({ error: "Article ID is required" });
    }

    console.log("Received quantities:", {
      quantite_a_stocker,
      quantite_a_demander,
      article_id,
      category_id,
      article_name,
    });

    // Get the current authenticated user's employee ID first (outside transaction)
    let finalEmployeeId = employee_id;

    if (!finalEmployeeId) {
      // Find the employee record for the current authenticated user
      const currentUserEmployee = await container.prisma.employee.findFirst({
        where: {
          user_id: req.user!.id,
        },
      });

      if (currentUserEmployee) {
        finalEmployeeId = currentUserEmployee.id;
        console.log("Using current user's employee ID:", finalEmployeeId);
      } else {
        // If no employee record exists for the current user, create one
        const newEmployee = await container.prisma.employee.create({
          data: {
            user_id: req.user!.id,
          },
        });
        finalEmployeeId = newEmployee.id;
        console.log(
          "Created new employee record for current user:",
          finalEmployeeId
        );
      }
    }

    // Use provided target_date or default to tomorrow
    const now = new Date();
    let targetDate: Date;

    if (target_date) {
      // Parse the provided target_date (YYYY-MM-DD format)
      const [year, month, day] = target_date.split("-").map(Number);
      targetDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    } else {
      // Default to tomorrow if no target_date provided
      targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        12,
        0,
        0,
        0
      );
    }

    console.log("Creating bon de commande with target date:", targetDate);
    console.log("Target date formatted:", targetDate.toISOString());

    // Check if bon de commande already exists for this user on the target date
    // Create date range for the target date in local timezone
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    );

    // First, just check if bon de commande exists without complex includes
    const existingBonDeCommandeBasic =
      await container.prisma.bonDeCommande.findFirst({
        where: {
          employee_id: finalEmployeeId,
          target_date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (existingBonDeCommandeBasic) {
      // Check if article entry already exists (much faster query)
      const existingArticleEntry =
        await container.prisma.bonDeCommandeCategory.findFirst({
          where: {
            bon_de_commande_id: existingBonDeCommandeBasic.id,
            article_id: article_id,
            category_id: category_id,
          },
          select: {
            id: true,
            quantite_a_stocker: true,
            quantite_a_demander: true,
          },
        });

      if (existingArticleEntry) {
        // Check if quantities have actually changed
        const quantitiesChanged =
          existingArticleEntry.quantite_a_stocker !== quantite_a_stocker ||
          existingArticleEntry.quantite_a_demander !== quantite_a_demander;

        if (quantitiesChanged) {
          console.log("Updating existing article entry:", {
            entry_id: existingArticleEntry.id,
            article_id: article_id,
            category_id: category_id,
            old_stocker: existingArticleEntry.quantite_a_stocker,
            old_demander: existingArticleEntry.quantite_a_demander,
            new_stocker: quantite_a_stocker,
            new_demander: quantite_a_demander,
          });

          // Update the existing article entry
          // Convert null values to 0 for database storage
          await container.prisma.bonDeCommandeCategory.update({
            where: { id: existingArticleEntry.id },
            data: {
              quantite_a_stocker: quantite_a_stocker ?? 0,
              quantite_a_demander: quantite_a_demander ?? 0,
            },
          });
        } else {
          console.log(
            "Quantities unchanged, no update needed for article:",
            article_id
          );
        }
      } else {
        // Add new article entry
        console.log("Adding new article entry to existing bon de commande:", {
          article_id,
          category_id,
          quantite_a_stocker,
          quantite_a_demander,
        });

        await container.prisma.bonDeCommandeCategory.create({
          data: {
            bon_de_commande_id: existingBonDeCommandeBasic.id,
            category_id,
            article_id: article_id,
            quantite_a_stocker: quantite_a_stocker ?? 0,
            quantite_a_demander: quantite_a_demander ?? 0,
          },
        });
      }

      // Update target date if needed
      await container.prisma.bonDeCommande.update({
        where: { id: existingBonDeCommandeBasic.id },
        data: { target_date: targetDate },
      });

      // Send response immediately and return
      const endTime = Date.now();
      console.log(`Update operation completed in ${endTime - startTime}ms`);
      console.log("About to send update response...");
      clearTimeout(responseTimeout);
      res
        .status(200)
        .json({ id: existingBonDeCommandeBasic.id, updated: true });
      console.log("Update response sent successfully");
      return;
    }

    console.log("Creating new bon de commande with date:", targetDate);

    // Create description based on the date
    const dateDescription = `Bon de commande du ${targetDate.toLocaleDateString(
      "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )}`;

    // Generate the next code
    const lastBonDeCommande = await container.prisma.bonDeCommande.findFirst({
      orderBy: {
        code: "desc",
      },
    });

    let code = "BC-01";
    if (lastBonDeCommande) {
      const lastNumber = parseInt(lastBonDeCommande.code.replace("BC-", ""));
      const nextNumber = lastNumber + 1;
      code = `BC-${nextNumber.toString().padStart(2, "0")}`;
    }

    const bonDeCommande = await container.prisma.bonDeCommande.create({
      data: {
        code,
        description: dateDescription,
        status: "en attente",
        employee_id: finalEmployeeId,
        created_at: now, // Use current date for creation timestamp
        target_date: targetDate, // Use the target date for target date
      },
    });

    // Create the bon de commande category relationship
    // Convert null values to 0 for database storage
    await container.prisma.bonDeCommandeCategory.create({
      data: {
        bon_de_commande_id: bonDeCommande.id,
        category_id,
        article_id: article_id, // Article-level entry
        quantite_a_stocker: quantite_a_stocker ?? 0,
        quantite_a_demander: quantite_a_demander ?? 0,
      },
    });

    // Send response immediately
    const endTime = Date.now();
    console.log(`Create operation completed in ${endTime - startTime}ms`);
    console.log("About to send create response...");
    clearTimeout(responseTimeout);
    res.status(201).json({ id: bonDeCommande.id, created: true });
    console.log("Create response sent successfully");
  } catch (error: any) {
    const endTime = Date.now();
    console.error(`Error after ${endTime - startTime}ms:`, error);
    clearTimeout(responseTimeout);

    // Provide more specific error messages
    if (error.code === "P2002") {
      return res.status(400).json({
        error:
          "A bon de commande with this code already exists. Please try again.",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Invalid reference. Please check that the category and article exist.",
      });
    }

    if (error.message) {
      return res.status(400).json({ error: error.message });
    }

    res.status(400).json({
      error: "An unexpected error occurred while creating the bon de commande",
    });
  } finally {
    // Ensure timeout is always cleared
    clearTimeout(responseTimeout);
  }
});

// Get all bon de commande
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log(
      `[Router] GET / - User ID: ${req.user!.id}, Role ID: ${req.user!.roleId}`
    );

    // Get the user's role to determine what they can see
    const userRole = await container.prisma.role.findUnique({
      where: { id: req.user!.roleId },
      select: { name: true },
    });

    console.log(`[Router] User role from database:`, userRole);

    const bonDeCommandes =
      await container.BonDeCommandeService.getAllBonDeCommande(
        req.user!.id,
        userRole?.name
      );
    res.status(200).json(bonDeCommandes);
  } catch (error: any) {
    console.error(`[Router] Error in GET /:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get bon de commande by ID
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const bonDeCommande =
      await container.BonDeCommandeService.getBonDeCommandeById(req.params.id);
    if (!bonDeCommande) {
      return res.status(404).json({ error: "Bon de commande not found" });
    }
    res.status(200).json(bonDeCommande);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update bon de commande category
router.put(
  "/category/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      console.log(
        "[BonDeCommande API] Updating category ID:",
        req.params.id,
        "Data:",
        req.body
      );

      const { quantite_a_stocker, quantite_a_demander } = req.body;

      if (
        quantite_a_stocker === undefined &&
        quantite_a_demander === undefined
      ) {
        return res
          .status(400)
          .json({ error: "At least one quantity field must be provided" });
      }

      const updateData: any = {};
      if (quantite_a_stocker !== undefined)
        updateData.quantite_a_stocker = quantite_a_stocker;
      if (quantite_a_demander !== undefined)
        updateData.quantite_a_demander = quantite_a_demander;

      const updatedCategory =
        await container.BonDeCommandeService.updateCategory(
          req.params.id,
          updateData
        );

      if (!updatedCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      console.log(
        "[BonDeCommande API] Category updated successfully:",
        updatedCategory
      );
      res.status(200).json(updatedCategory);
    } catch (error: any) {
      console.error("[BonDeCommande API] Error updating category:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Update bon de commande
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const bonDeCommande =
      await container.BonDeCommandeService.updateBonDeCommande(
        req.params.id,
        req.body
      );
    res.status(200).json(bonDeCommande);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update bon de commande status
router.put(
  "/:id/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      console.log(
        "[BonDeCommande API] Updating status for ID:",
        req.params.id,
        "New status:",
        req.body.status
      );

      const { status } = req.body;

      if (!status || (status !== "en attente" && status !== "confirmer")) {
        return res
          .status(400)
          .json({ error: "Status must be 'en attente' or 'confirmer'" });
      }

      const updatedBonDeCommande =
        await container.BonDeCommandeService.updateStatus(
          req.params.id,
          status
        );

      if (!updatedBonDeCommande) {
        return res.status(404).json({ error: "Bon de commande not found" });
      }

      console.log(
        "[BonDeCommande API] Status updated successfully:",
        updatedBonDeCommande
      );
      res.status(200).json(updatedBonDeCommande);
    } catch (error: any) {
      console.error("[BonDeCommande API] Error updating status:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete bon de commande
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const bonDeCommande =
        await container.BonDeCommandeService.deleteBonDeCommande(req.params.id);
      res.status(200).json(bonDeCommande);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
