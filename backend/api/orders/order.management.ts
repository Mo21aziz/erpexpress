import express, { Request, Response } from "express";
import container from "../../lib/container";

const router = express.Router();

// Get orders by date
router.get("/by-date/:date", async (req: Request, res: Response) => {
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
      mockOrderData.items = mockOrderData.items.filter(
        (item) => item.category === category
      );
    }

    res.status(200).json(mockOrderData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all available dates
router.get("/dates", async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order item
router.put("/item/:id", async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
