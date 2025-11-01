"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Get orders by date
router.get("/by-date/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const { category } = req.query;
        // Mock data based on the image structure
        const mockOrderData = {
            date: date,
            title: "corniche",
            items: [
                // Légumes (Vegetables)
                {
                    id: "1",
                    packaging: "1kg",
                    article: "Laitue",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "legumes",
                },
                {
                    id: "2",
                    packaging: "1kg",
                    article: "pepper",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "legumes",
                },
                {
                    id: "3",
                    packaging: "1kg",
                    article: "tomate",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "legumes",
                },
                {
                    id: "4",
                    packaging: "0.5kg",
                    article: "tomate c",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "legumes",
                },
                {
                    id: "5",
                    packaging: "2kg",
                    article: "oignon",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "legumes",
                },
                // Divere (Diverse/Miscellaneous)
                {
                    id: "6",
                    packaging: "",
                    article: "",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "divere",
                },
                {
                    id: "7",
                    packaging: "",
                    article: "",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "divere",
                },
                {
                    id: "8",
                    packaging: "",
                    article: "",
                    stock: 0,
                    demand: 0,
                    delivery: 0,
                    category: "divere",
                },
            ],
        };
        // Filter by category if specified
        if (category && category !== "all") {
            mockOrderData.items = mockOrderData.items.filter((item) => item.category === category);
        }
        res.status(200).json(mockOrderData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get all available dates
router.get("/dates", async (req, res) => {
    try {
        // Mock available dates
        const availableDates = [
            "2024-01-15",
            "2024-01-16",
            "2024-01-17",
            "2024-01-18",
            "2024-01-19",
        ];
        res.status(200).json(availableDates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update order item
router.put("/item/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, demand, delivery } = req.body;
        // Mock update response
        const updatedItem = {
            id,
            stock: stock || 0,
            demand: demand || 0,
            delivery: delivery || 0,
        };
        res.status(200).json(updatedItem);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
