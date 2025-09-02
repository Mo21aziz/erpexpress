import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package, FileText } from "lucide-react";
import { bonDeCommandeApi } from "@/api/bon-de-commande";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPages } from "@/utils/roleUtils";
import { useState, useEffect } from "react";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  resourceCount: number;
  assignedCount: number;
  onEdit: (id: string) => void;
  onDelete: (category: {
    id: string;
    name: string;
    description: string;
    resourceCount: number;
    assignedCount: number;
  }) => void;
  onClick: () => void;
  selectedDate?: string;
}

export function CategoryCard({
  id,
  name,
  description,
  resourceCount,
  assignedCount,
  onEdit,
  onDelete,
  onClick,
  selectedDate,
}: CategoryCardProps) {
  const [hasConfirmedBonDeCommande, setHasConfirmedBonDeCommande] =
    useState(false);
  const utilizationRate =
    resourceCount > 0 ? Math.round((assignedCount / resourceCount) * 100) : 0;
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageCategories =
    user && user.role ? canAccessAdminPages(user.role.name) : false;

  // Check for confirmed bon de commande on mount and when selectedDate changes
  useEffect(() => {
    const checkConfirmedBonDeCommande = async () => {
      try {
        // Use selected date or default to tomorrow
        const targetDate =
          selectedDate ||
          (() => {
            const today = new Date();
            const tomorrow = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + 1
            );
            return tomorrow.toISOString().split("T")[0];
          })();

        // Fetch all bon de commande
        const allBonDeCommandes = await bonDeCommandeApi.getBonDeCommande();

        // Check if any bon de commande is confirmed for the target date
        const confirmedBonDeCommande = allBonDeCommandes.find((bdc) => {
          const bdcDate = new Date(bdc.target_date).toISOString().split("T")[0];
          return bdcDate === targetDate && bdc.status === "confirmer";
        });

        setHasConfirmedBonDeCommande(!!confirmedBonDeCommande);
      } catch (error) {
        console.error("Error checking confirmed bon de commande:", error);
      }
    };

    if (selectedDate) {
      checkConfirmedBonDeCommande();
    }
  }, [selectedDate]);

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

    if (hasConfirmedBonDeCommande) {
      toast({
        title: "❌ Erreur",
        description:
          "Impossible de modifier les quantités car le bon de commande est déjà confirmé.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if there are any articles in this category
      if (resourceCount === 0) {
        toast({
          title: "ℹ️ Information",
          description: "Cette catégorie ne contient aucun article.",
        });
        return;
      }

      // Use selected date or default to tomorrow
      const targetDate =
        selectedDate ||
        (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.toISOString().split("T")[0];
        })();

      // Create bon de commande data for category-level entry
      const bonDeCommandeData = {
        description: `Bon de commande pour ${name} - ${targetDate}`,
        category_id: id,
        // No article_id for category-level entries
        quantite_a_stocker: resourceCount,
        quantite_a_demander: assignedCount,
        article_name: name, // Using category name as article name for category-level bon de commande
        target_date: targetDate,
      };

      await bonDeCommandeApi.createBonDeCommande(bonDeCommandeData);

      toast({
        title: "✅ Succès",
        description: `Bon de commande pour la catégorie "${name}" sauvegardé en base de données pour demain!`,
      });
    } catch (err: unknown) {
      let message = "Failed to create bon de commande";

      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          message = `Bon de commande pour la catégorie "${name}" existe déjà pour demain`;
        } else {
          message =
            err.response?.data?.error || "Failed to create bon de commande";
        }
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
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>{name}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={
                hasConfirmedBonDeCommande || !selectedDate
                  ? undefined
                  : handleCreateBonDeCommande
              }
              className={
                hasConfirmedBonDeCommande || !selectedDate
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              }
              title={
                !selectedDate
                  ? "Veuillez sélectionner une date d'abord"
                  : hasConfirmedBonDeCommande
                  ? "Impossible de modifier car le bon de commande est confirmé"
                  : "Créer bon de commande pour la date sélectionnée"
              }
              disabled={hasConfirmedBonDeCommande || !selectedDate}
            >
              <FileText className="h-4 w-4" />
            </Button>
            {canManageCategories && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
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
                    onDelete({
                      id,
                      name,
                      description,
                      resourceCount,
                      assignedCount,
                    });
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
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {resourceCount}
            </div>
            <div className="text-sm text-gray-600">nombre d'article</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
