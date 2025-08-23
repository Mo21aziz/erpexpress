import express, { Request, Response } from "express";
import container from "../lib/container";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// Create bon de commande
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      description,
      employee_id,
      category_id,
      article_id,
      quantite_a_stocker,
      quantite_a_demander,
      article_name,
    } = req.body;

    console.log("Received quantities:", {
      quantite_a_stocker,
      quantite_a_demander,
      article_id,
      category_id,
      article_name,
    });

    // Create bon de commande with tomorrow's date in local timezone
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      12,
      0,
      0,
      0
    );

    console.log("Creating bon de commande with date:", tomorrow);
    console.log("Tomorrow formatted:", tomorrow.toISOString());

    // Get the current authenticated user's employee ID
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

    // Check if bon de commande already exists for this user on tomorrow's date
    // Create date range for tomorrow in local timezone
    const startOfDay = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );
    const endOfDay = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate() + 1
    );

    const existingBonDeCommande =
      await container.prisma.bonDeCommande.findFirst({
        where: {
          employee_id: finalEmployeeId,
          target_date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          categories: {
            include: {
              category: true,
              article: true,
            },
          },
        },
      });

    if (existingBonDeCommande) {
      console.log("Found existing bon de commande:", existingBonDeCommande);
      console.log("Existing created_at:", existingBonDeCommande.created_at);

      // Clean up any existing category-level entries for this category when switching to article-level
      const categoryLevelEntries = existingBonDeCommande.categories.filter(
        (cat) => cat.category_id === category_id && !cat.article_id
      );

      if (categoryLevelEntries.length > 0) {
        console.log(
          "Found old category-level entries, cleaning up:",
          categoryLevelEntries.length
        );
        for (const entry of categoryLevelEntries) {
          await container.prisma.bonDeCommandeCategory.delete({
            where: { id: entry.id },
          });
        }
      }

      // Look for existing article-level entry
      let existingArticleEntry: any = null;
      let shouldUpdate = false;

      // Look for existing article-level entry
      existingArticleEntry = existingBonDeCommande.categories.find(
        (cat) =>
          cat.article_id === article_id && cat.category_id === category_id
      );

      if (existingArticleEntry) {
        shouldUpdate = true;
      }

      if (existingArticleEntry && shouldUpdate) {
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
          await container.prisma.bonDeCommandeCategory.update({
            where: { id: existingArticleEntry.id },
            data: {
              quantite_a_stocker: quantite_a_stocker,
              quantite_a_demander: quantite_a_demander,
            },
          });
        } else {
          console.log(
            "Quantities unchanged, no update needed for article:",
            article_id
          );
        }
      } else {
        // Add new article entry (individual article quantities)
        console.log("Adding new article entry to existing bon de commande:", {
          article_id,
          category_id,
          quantite_a_stocker,
          quantite_a_demander,
        });

        await container.prisma.bonDeCommandeCategory.create({
          data: {
            bon_de_commande_id: existingBonDeCommande.id,
            category_id,
            article_id: article_id, // Individual article entry
            quantite_a_stocker,
            quantite_a_demander,
          },
        });
      }

      // Update the target_date to tomorrow's date
      await container.prisma.bonDeCommande.update({
        where: { id: existingBonDeCommande.id },
        data: {
          target_date: tomorrow,
        },
      });

      // Return the updated bon de commande
      const updatedBonDeCommande =
        await container.BonDeCommandeService.getBonDeCommandeById(
          existingBonDeCommande.id
        );

      if (updatedBonDeCommande) {
        console.log(
          "Updated bon de commande:",
          JSON.stringify(updatedBonDeCommande, null, 2)
        );

        // Log the number of categories to help debug
        console.log(
          `Bon de commande now has ${updatedBonDeCommande.categories.length} category entries`
        );

        return res.status(200).json(updatedBonDeCommande);
      } else {
        throw new Error("Failed to retrieve updated bon de commande");
      }
    }

    console.log("Creating new bon de commande with date:", tomorrow);

    // Create description based on the date
    const dateDescription = `Bon de commande du ${tomorrow.toLocaleDateString(
      "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )}`;

    const bonDeCommande =
      await container.BonDeCommandeService.createBonDeCommande({
        description: dateDescription,
        status: "en attente",
        employee_id: finalEmployeeId,
        created_at: now, // Use current date for creation timestamp
        target_date: tomorrow, // Use tomorrow's date for target date
        category_id,
        article_id: article_id, // Article-level entry
        quantite_a_stocker,
        quantite_a_demander,
      });

    console.log("Created bon de commande with date:", bonDeCommande.created_at);
    console.log(
      "Created bon de commande full data:",
      JSON.stringify(bonDeCommande, null, 2)
    );
    res.status(201).json(bonDeCommande);
  } catch (error: any) {
    console.error("Error creating bon de commande:", error);
    res.status(400).json({ error: error.message });
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
