import express, { Request, Response } from "express";
import container from "../../lib/container";

const router = express.Router();

// Get all categories
router.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await container.CategoryService.getCategories(req.query);
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get paginated categories
router.get("/paginated", async (req: Request, res: Response) => {
  try {
    const result = await container.CategoryService.getPaginatedCategories(
      req.query
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single category
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const category = await container.CategoryService.getCategoryById(
      req.params.id
    );
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post("/add", async (req: Request, res: Response) => {
  try {
    const category = await container.CategoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update category
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const category = await container.CategoryService.updateCategory(
      req.params.id,
      req.body
    );
    res.status(200).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete category (hard delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { cascade } = req.query;

    if (cascade === "true") {
      // Cascade delete - delete category and all associated data
      const category =
        await container.CategoryService.deleteCategoryWithCascade(
          req.params.id
        );
      res.status(200).json(category);
    } else {
      // Regular delete - check for dependencies first
      const category = await container.CategoryService.deleteCategory(
        req.params.id
      );
      res.status(200).json(category);
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
