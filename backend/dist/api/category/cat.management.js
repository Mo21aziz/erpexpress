"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = __importDefault(require("../../lib/container"));
const router = express_1.default.Router();
// Get all categories
router.get("/", async (req, res) => {
    try {
        const categories = await container_1.default.CategoryService.getCategories(req.query);
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get paginated categories
router.get("/paginated", async (req, res) => {
    try {
        const result = await container_1.default.CategoryService.getPaginatedCategories(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get single category
router.get("/:id", async (req, res) => {
    try {
        const category = await container_1.default.CategoryService.getCategoryById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create category
router.post("/add", async (req, res) => {
    try {
        const category = await container_1.default.CategoryService.createCategory(req.body);
        res.status(201).json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update category
router.put("/:id", async (req, res) => {
    try {
        const category = await container_1.default.CategoryService.updateCategory(req.params.id, req.body);
        res.status(200).json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Delete category (hard delete)
router.delete("/:id", async (req, res) => {
    try {
        const { cascade } = req.query;
        if (cascade === "true") {
            // Cascade delete - delete category and all associated data
            const category = await container_1.default.CategoryService.deleteCategoryWithCascade(req.params.id);
            res.status(200).json(category);
        }
        else {
            // Regular delete - check for dependencies first
            const category = await container_1.default.CategoryService.deleteCategory(req.params.id);
            res.status(200).json(category);
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
