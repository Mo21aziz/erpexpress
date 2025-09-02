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
import { useState, useEffect, useRef } from "react";
import { bonDeCommandeApi } from "@/api/bon-de-commande";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPages } from "@/utils/roleUtils";

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
    quantite_a_stocker: any;
    quantite_a_demander: any;
  };
  disabled?: boolean;
  selectedDate?: string;
}

export function ArticleCard({
  article,
  onEdit,
  onDelete,
  onQuantityChange,
  lastBonDeCommandeValues,
  disabled = false,
  selectedDate,
}: ArticleCardProps) {
  // Initialize with empty values
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [demandQuantity, setDemandQuantity] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageArticles =
    user && user.role ? canAccessAdminPages(user.role.name) : false;

  // Track if user has manually changed values
  const hasUserChangedValues = useRef(false);

  // Reset user change flag when article changes
  useEffect(() => {
    console.log("ArticleCard: Article changed, resetting user change flag");
    hasUserChangedValues.current = false;
    // Reset quantities to empty when article changes
    setStockQuantity(null);
    setDemandQuantity(null);
  }, [article.id]);

  const handleCreateBonDeCommande = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if date is selected
    if (!selectedDate) {
      toast({
        title: "❌ Date requise",
        description:
          "Veuillez sélectionner une date avant de créer un bon de commande.",
        variant: "destructive",
      });
      return;
    }

    if (disabled) {
      toast({
        title: "❌ Erreur",
        description:
          "Impossible de modifier les quantités car le bon de commande est déjà confirmé.",
        variant: "destructive",
      });
      return;
    }

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

      // Use selected date or default to tomorrow
      const targetDate =
        selectedDate ||
        (() => {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return tomorrow.toISOString().split("T")[0];
        })();

      // Create bon de commande data
      const bonDeCommandeData = {
        description: `Bon de commande du ${targetDate}`,
        category_id: article.category_id,
        article_id: article.id,
        quantite_a_stocker: stockQuantity || 0,
        quantite_a_demander: demandQuantity || 0,
        article_name: article.name,
        target_date: targetDate,
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

      // Check if the error is about confirmed bon de commande
      if (message.includes("confirmed bon de commande")) {
        message =
          "Impossible de modifier les quantités car le bon de commande est déjà confirmé.";
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
              onClick={
                disabled || !selectedDate
                  ? undefined
                  : handleCreateBonDeCommande
              }
              className={
                disabled || !selectedDate
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              }
              title={
                !selectedDate
                  ? "Veuillez sélectionner une date d'abord"
                  : disabled
                  ? "Impossible de modifier car le bon de commande est confirmé"
                  : "Créer bon de commande pour la date sélectionnée"
              }
              disabled={disabled || !selectedDate}
            >
              <FileText className="h-4 w-4" />
            </Button>
            {canManageArticles && (
              <>
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
              </>
            )}
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
            <span className="text-sm text-gray-600"> stock:</span>
            <Input
              type="number"
              min="0"
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : Number(e.target.value);
                console.log("ArticleCard: Stock quantity changed to:", value);
                setStockQuantity(value);
                hasUserChangedValues.current = true;
                onQuantityChange?.(
                  article.id,
                  "quantite_a_stocker",
                  value || 0
                );
              }}
              className="w-16 h-8 text-xs"
              placeholder=""
              disabled={disabled}
            />
          </div>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600"> demande:</span>
            <Input
              type="number"
              min="0"
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : Number(e.target.value);
                console.log("ArticleCard: Demand quantity changed to:", value);
                setDemandQuantity(value);
                hasUserChangedValues.current = true;
                onQuantityChange?.(
                  article.id,
                  "quantite_a_demander",
                  value || 0
                );
              }}
              className="w-16 h-8 text-xs"
              placeholder=""
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
