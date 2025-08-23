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
}: CategoryCardProps) {
  const utilizationRate =
    resourceCount > 0 ? Math.round((assignedCount / resourceCount) * 100) : 0;
  const { toast } = useToast();

  const handleCreateBonDeCommande = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      // Check if there are any articles in this category
      if (resourceCount === 0) {
        toast({
          title: "ℹ️ Information",
          description: "Cette catégorie ne contient aucun article.",
        });
        return;
      }

      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

      // Create bon de commande data for category-level entry
      const bonDeCommandeData = {
        description: `Bon de commande pour ${name} - ${tomorrowFormatted}`,
        category_id: id,
        // No article_id for category-level entries
        quantite_a_stocker: resourceCount,
        quantite_a_demander: assignedCount,
        article_name: name, // Using category name as article name for category-level bon de commande
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>{name}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateBonDeCommande}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Créer bon de commande pour demain"
            >
              <FileText className="h-4 w-4" />
            </Button>
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
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
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
