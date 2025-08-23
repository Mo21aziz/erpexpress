import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Box,
  Edit,
  Trash2,
  Package2,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { Article } from "@/types/database";
import { useState, useEffect } from "react";
import { bonDeCommandeApi } from "@/api/bon-de-commande";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onQuantityChange?: (
    articleId: string,
    field: "quantite_a_stocker" | "quantite_a_demander",
    value: number
  ) => void;
  lastBonDeCommandeValues?: {
    quantite_a_stocker: number;
    quantite_a_demander: number;
  };
}

export function ArticleCard({
  article,
  onEdit,
  onDelete,
  onQuantityChange,
  lastBonDeCommandeValues,
}: ArticleCardProps) {
  // Initialize with either last bon de commande values or article's own values
  const initialStock =
    lastBonDeCommandeValues?.quantite_a_stocker ??
    article.quantite_a_stocker ??
    0;
  const initialDemand =
    lastBonDeCommandeValues?.quantite_a_demander ??
    article.quantite_a_demander ??
    0;

  const [stockQuantity, setStockQuantity] = useState<number>(initialStock);
  const [demandQuantity, setDemandQuantity] = useState<number>(initialDemand);
  const { toast } = useToast();

  // Update state when props change
  useEffect(() => {
    setStockQuantity(
      lastBonDeCommandeValues?.quantite_a_stocker ??
        article.quantite_a_stocker ??
        0
    );
    setDemandQuantity(
      lastBonDeCommandeValues?.quantite_a_demander ??
        article.quantite_a_demander ??
        0
    );
  }, [article, lastBonDeCommandeValues]);

  const handleCreateBonDeCommande = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Get the original values for comparison
      const originalStock =
        lastBonDeCommandeValues?.quantite_a_stocker ??
        article.quantite_a_stocker ??
        0;
      const originalDemand =
        lastBonDeCommandeValues?.quantite_a_demander ??
        article.quantite_a_demander ??
        0;

      // Check if quantities have changed (including changes to/from 0)
      const quantitiesChanged =
        stockQuantity !== originalStock || demandQuantity !== originalDemand;

      if (!quantitiesChanged) {
        toast({
          title: "ℹ️ Information",
          description:
            "Aucune modification détectée. Les quantités sont déjà à jour.",
        });
        return;
      }

      // Get tomorrow's date
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

      // Create bon de commande data
      const bonDeCommandeData = {
        description: `Bon de commande du ${tomorrowFormatted}`,
        category_id: article.category_id,
        article_id: article.id,
        quantite_a_stocker: stockQuantity,
        quantite_a_demander: demandQuantity,
        article_name: article.name,
      };

      await bonDeCommandeApi.createBonDeCommande(bonDeCommandeData);

      toast({
        title: "✅ Succès",
        description: `Bon de commande pour "${article.name}" mis à jour!`,
      });
    } catch (err: unknown) {
      let message = "Failed to create bon de commande";
      if (err instanceof AxiosError) {
        message = err.response?.data?.error || message;
      }
      toast({
        title: "❌ Erreur",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Package className="h-5 w-5 text-green-600" />
            <span>{article.name}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateBonDeCommande}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Créer bon de commande"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(article);
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(article);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Box className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">
            Collisage: <span className="font-medium">{article.collisage}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">
            Type: <span className="font-medium capitalize">{article.type}</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package2 className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-gray-600">Quantité a stocker:</span>
            <Input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                setStockQuantity(value);
                onQuantityChange?.(article.id, "quantite_a_stocker", value);
              }}
              className="w-16 h-8 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Quantité a demander:</span>
            <Input
              type="number"
              min="0"
              value={demandQuantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                setDemandQuantity(value);
                onQuantityChange?.(article.id, "quantite_a_demander", value);
              }}
              className="w-16 h-8 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
