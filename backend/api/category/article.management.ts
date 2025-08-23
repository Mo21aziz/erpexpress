import express, { Request, Response } from "express";
import container from "../../lib/container";
import { Article } from "../../types/article";
const router = express.Router();

// Create Article
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("[Article API] Creating article with data:", req.body);
    const article = await container.ArticleService.createArticle(req.body);
    console.log("[Article API] Article created successfully:", article);
    res.status(201).json(article);
  } catch (error: any) {
    console.error("[Article API] Error creating article:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get Article by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const article = await container.ArticleService.getArticleById(
      req.params.id
    );
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.status(200).json(article);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Article
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const article = await container.ArticleService.updateArticle(
      req.params.id,
      req.body
    );
    res.status(200).json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Article
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const article = await container.ArticleService.deleteArticle(req.params.id);
    res.status(200).json(article);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get Articles by Category
router.get("/by-category/:categoryId", async (req: Request, res: Response) => {
  try {
    const articles = await container.ArticleService.getArticlesByCategory(
      req.params.categoryId
    );
    res.status(200).json(articles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all articles
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category_id } = req.query;

    if (category_id) {
      // If category_id is provided, get articles for that specific category
      const articles = await container.ArticleService.getArticlesByCategory(
        category_id as string
      );
      res.status(200).json(articles);
    } else {
      // If no category_id, get all articles
      const articles = await container.ArticleService.getAllArticles(req.query);
      res.status(200).json(articles);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
