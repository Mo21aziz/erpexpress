import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Package, Plus, Check } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import { ArticleFormModal } from "./ArticleFormModal";
import { Article, Category } from "@/types/database";
import { articles as articlesApi } from "@/api/articles";
import { bonDeCommandeApi } from "@/api/bon-de-commande";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPages } from "@/utils/roleUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryArticlesModal({
  isOpen,
  onClose,
  category,
}: CategoryArticlesModalProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleFormOpen, setArticleFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [lastBonDeCommandeValues, setLastBonDeCommandeValues] = useState<
    Record<string, { quantite_a_stocker: number; quantite_a_demander: number }>
  >({});
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageArticles =
    user && user.role ? canAccessAdminPages(user.role.name) : false;

  const fetchLastBonDeCommandeValues = async () => {
    if (!category) return;

    try {
      // Get tomorrow's date
      const today = new Date();
      const tomorrow = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );
      const tomorrowFormatted =
        tomorrow.getFullYear() +
        "-" +
        String(tomorrow.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(tomorrow.getDate()).padStart(2, "0");

      // Fetch all bon de commande
      const allBonDeCommandes = await bonDeCommandeApi.getBonDeCommande();

      // Find the latest bon de commande for tomorrow's date
      const latestBonDeCommande = allBonDeCommandes
        .filter((bdc) => {
          const bdcDate = new Date(bdc.created_at).toISOString().split("T")[0];
          return bdcDate === tomorrowFormatted;
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

      if (latestBonDeCommande) {
        // Create a map of article quantities from the bon de commande
        const articleQuantities: Record<
          string,
          { quantite_a_stocker: number; quantite_a_demander: number }
        > = {};

        latestBonDeCommande.categories.forEach((cat) => {
          if (cat.article_id) {
            articleQuantities[cat.article_id] = {
              quantite_a_stocker: cat.quantite_a_stocker,
              quantite_a_demander: cat.quantite_a_demander,
            };
          }
        });

        setLastBonDeCommandeValues(articleQuantities);
      }
    } catch (error) {
      console.error("Error fetching last bon de commande values:", error);
    }
  };

  const fetchArticles = async () => {
    if (!category) return;

    setLoading(true);
    try {
      const data = await articlesApi.getArticlesByCategory(category.id);
      setArticles(data);

      // Fetch last bon de commande values
      await fetchLastBonDeCommandeValues();

      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to load articles"
          : "Failed to load articles";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && category) {
      fetchArticles();
    }
  }, [isOpen, category]);

  const handleAddArticle = () => {
    setFormMode("add");
    setEditingArticle(null);
    setArticleFormOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    setFormMode("edit");
    setEditingArticle(article);
    setArticleFormOpen(true);
  };

  const handleDeleteArticle = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      await articlesApi.deleteArticle(articleToDelete.id);
      setArticles(articles.filter((art) => art.id !== articleToDelete.id));
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to delete article"
          : "Failed to delete article";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleArticleSubmit = async (_article: Article) => {
    // Always refresh from server to reflect numero shifts on other articles
    await fetchArticles();
  };

  const handleQuantityChange = (
    articleId: string,
    field: "quantite_a_stocker" | "quantite_a_demander",
    value: number
  ) => {
    // Debug logging
    console.log(`Quantity change for article ${articleId}:`, {
      field,
      value,
      valueType: typeof value,
      isZero: value === 0,
    });

    // Only update the local state, don't save to database until "Valider" is pressed
    setArticles(
      articles.map((art) =>
        art.id === articleId ? { ...art, [field]: value } : art
      )
    );
  };

  const handleValidate = async () => {
    if (isSubmitting) return; // Prevent multiple simultaneous requests
    if (!category) return; // Early return if category is null

    setIsSubmitting(true);
    setError(null);

    try {
      const articlesToUpdate = articles.filter(
        (article) =>
          (article.quantite_a_stocker !== null &&
            article.quantite_a_stocker !== undefined &&
            article.quantite_a_stocker >= 0) ||
          (article.quantite_a_demander !== null &&
            article.quantite_a_demander !== undefined &&
            article.quantite_a_demander >= 0)
      );

      if (articlesToUpdate.length === 0) {
        toast({
          title: "⚠️ Attention",
          description:
            "Aucun article avec des quantités définies à mettre à jour.",
          variant: "destructive",
        });
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const promises = articlesToUpdate.map(async (article) => {
        const stock = Number(article.quantite_a_stocker ?? 0);
        const demand = Number(article.quantite_a_demander ?? 0);

        console.log(`Sending data for ${article.name}:`, {
          article_id: article.id,
          category_id: category.id,
          stock: stock,
          demand: demand,
        });

        return bonDeCommandeApi.createBonDeCommande({
          description: `Bon de commande du ${tomorrowFormatted}`,
          category_id: category.id,
          article_id: article.id, // Send individual article_id
          quantite_a_stocker: stock,
          quantite_a_demander: demand,
          article_name: article.name,
        });
      });

      await Promise.all(promises);

      toast({
        title: "✅ Succès",
        description: `Bon de commande mis à jour pour ${articlesToUpdate.length} article(s) pour demain!`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error ||
            "Failed to create/update bon de commande"
          : err instanceof Error
          ? err.message
          : "Failed to create/update bon de commande";

      setError(message);
      toast({
        title: "❌ Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h2>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleValidate}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={articles.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validation...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Valider
                </>
              )}
            </Button>
            {canManageArticles && (
              <Button
                variant="default"
                size="sm"
                onClick={handleAddArticle}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Article
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2">Loading articles...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p className="font-semibold">Error loading articles</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p className="font-semibold">No articles found</p>
                <p className="text-sm">
                  This category doesn't have any articles yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Articles ({articles.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onEdit={handleEditArticle}
                    onDelete={handleDeleteArticle}
                    onQuantityChange={handleQuantityChange}
                    lastBonDeCommandeValues={
                      lastBonDeCommandeValues[article.id]
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Form Modal */}
      <ArticleFormModal
        isOpen={articleFormOpen}
        onClose={() => setArticleFormOpen(false)}
        onSubmit={handleArticleSubmit}
        categoryId={category.id}
        initialData={editingArticle || undefined}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setArticleToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the article "
              {articleToDelete?.name}"? This action cannot be undone and will
              permanently remove the article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setArticleToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteArticle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
