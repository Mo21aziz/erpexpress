import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package, Eye } from "lucide-react";
import { Article } from "@/types/database";
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

interface ArticlesTableProps {
  articles: Article[];
  loading: boolean;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

export const ArticlesTable = ({
  articles,
  loading,
  onEdit,
  onDelete,
}: ArticlesTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      onDelete(articleToDelete);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const formatPrice = (price: number | null | any) => {
    if (price === null || price === undefined) return "N/A";

    // Handle Decimal objects from Prisma
    if (
      typeof price === "object" &&
      price !== null &&
      typeof price.toNumber === "function"
    ) {
      return `${price.toNumber().toFixed(2)} DH`;
    }

    // Handle regular numbers
    if (typeof price === "number") {
      return `${price.toFixed(2)} DH`;
    }

    // Handle string numbers
    const numPrice = Number(price);
    if (!isNaN(numPrice)) {
      return `${numPrice.toFixed(2)} DH`;
    }

    return "N/A";
  };

  const formatNumero = (numero: number | undefined) => {
    if (numero === undefined || numero === null) return "N/A";
    return numero.toString().padStart(3, "0");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mb-4"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Chargement des articles...
          </h3>
          <p className="text-gray-500">
            Veuillez patienter pendant que nous récupérons les données
          </p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Aucun article trouvé
        </h3>
        <p className="text-gray-500 mb-6">
          Il n'y a pas d'articles correspondant à vos critères de recherche
        </p>
        <div className="text-sm text-gray-400">
          <p>
            💡 Essayez de modifier vos filtres ou de rechercher avec d'autres
            termes
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span>🔢</span>
                  <span>Numéro</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span>📂</span>
                  <span>Catégorie</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>Nom</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Collisage</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span>🏷️</span>
                  <span>Type</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Prix</span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <div className="flex items-center justify-end space-x-2">
                  <span>⚙️</span>
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {articles.map((article, index) => (
              <tr
                key={article.id}
                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-sm border border-green-200">
                        <span className="text-sm font-bold text-green-800">
                          {formatNumero(article.numero)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {article.category?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {article.name}
                  </div>
                  {article.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                      {article.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm">
                    📊 {article.collisage}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      article.type === "catering"
                        ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200"
                        : "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200"
                    }`}
                  >
                    {article.type === "catering" ? "🍽️ Catering" : "📦 Sonodis"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium">
                    💰 {formatPrice(article.price)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(article)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(article)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'article "
              {articleToDelete?.name}" ? Cette action ne peut pas être annulée
              et supprimera définitivement l'article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setArticleToDelete(null);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
