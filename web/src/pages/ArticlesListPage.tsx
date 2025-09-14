import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ArticlesTable } from "@/components/articles/ArticlesTable";
import { Button } from "@/components/ui/button";
import { PackagePlus, Search, Filter } from "lucide-react";
import { Article, Category } from "@/types/database";
import { articles as articlesApi } from "@/api/articles";
import { categories as categoriesApi } from "@/api/categoty";
import { ArticleFormModal } from "@/components/articles/ArticleFormModal";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPages } from "@/utils/roleUtils";

export function ArticlesListPage() {
  const [articlesData, setArticlesData] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user can manage articles
  const canManageArticles =
    user && user.role ? canAccessAdminPages(user.role.name) : false;

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articlesApi.getArticles();

      // Sanitize all articles to ensure they have required fields
      const sanitizedData = data.map((article) => ({
        ...article,
        name: article.name || "",
        description: article.description || "",
        collisage: article.collisage || "",
        type: article.type || "catering",
        price: article.price || 0,
        quantite_a_stocker: article.quantite_a_stocker || 0,
        quantite_a_demander: article.quantite_a_demander || 0,
      }));

      setArticlesData(sanitizedData);
      setError(null);
    } catch (err: unknown) {
      handleError(err, "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      handleError(err, "Failed to load categories");
    }
  };

  const handleError = (err: unknown, defaultMessage: string) => {
    console.error("Error:", err);
    const message =
      err instanceof AxiosError
        ? err.response?.data?.error || defaultMessage
        : defaultMessage;
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleCreateArticle = async (articleData: {
    name: string;
    description: string;
    price: number;
    collisage: string;
    type: string;
    numero?: number;
    category_id: string;
  }) => {
    try {
      console.log("Creating article with data:", articleData); // Debug log

      // Validate required fields before sending
      if (!articleData.category_id) {
        throw new Error("Category ID is required");
      }
      if (!articleData.collisage) {
        throw new Error("Collisage is required");
      }
      if (!articleData.type) {
        throw new Error("Article type is required");
      }
      if (articleData.type !== "catering" && articleData.type !== "sonodis") {
        throw new Error("Article type must be either 'catering' or 'sonodis'");
      }
      if (articleData.price < 0) {
        throw new Error("Price must be positive");
      }

      const newArticle = await articlesApi.createArticle(articleData);

      // Ensure all required fields have default values
      const sanitizedArticle = {
        ...newArticle,
        name: newArticle.name || "",
        description: newArticle.description || "",
        collisage: newArticle.collisage || "",
        type: newArticle.type || "catering",
        price: newArticle.price || 0,
        quantite_a_stocker: newArticle.quantite_a_stocker || 0,
        quantite_a_demander: newArticle.quantite_a_demander || 0,
      };

      setArticlesData((prev) => [...prev, sanitizedArticle]);
      setShowAddModal(false);
      toast({
        title: "Success",
        description: "Article created successfully",
      });
    } catch (err: unknown) {
      console.error("Error creating article:", err); // Debug log
      handleError(err, "Failed to create article");
    }
  };

  const handleUpdateArticle = async (
    id: string,
    articleData: {
      name: string;
      description: string;
      price: number;
      collisage: string;
      type: string;
      numero?: number;
      category_id: string;
    }
  ) => {
    try {
      const updatedArticle = await articlesApi.updateArticle(id, articleData);

      // Ensure all required fields have default values
      const sanitizedArticle = {
        ...updatedArticle,
        name: updatedArticle.name || "",
        description: updatedArticle.description || "",
        collisage: updatedArticle.collisage || "",
        type: updatedArticle.type || "catering",
        price: updatedArticle.price || 0,
        quantite_a_stocker: updatedArticle.quantite_a_stocker || 0,
        quantite_a_demander: updatedArticle.quantite_a_demander || 0,
      };

      setArticlesData((prev) =>
        prev.map((article) => (article.id === id ? sanitizedArticle : article))
      );
      setSelectedArticle(null);
      toast({
        title: "Success",
        description: "Article updated successfully",
      });
    } catch (err: unknown) {
      handleError(err, "Failed to update article");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await articlesApi.deleteArticle(id);
      setArticlesData((prev) => prev.filter((article) => article.id !== id));
      setSelectedArticle(null);
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    } catch (err: unknown) {
      handleError(err, "Failed to delete article");
    }
  };

  // Filter articles based on search term, type, and category
  const filteredArticles = articlesData.filter((article) => {
    try {
      const matchesSearch =
        (article.name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (article.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (article.collisage?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesType = filterType === "all" || article.type === filterType;
      const matchesCategory =
        filterCategory === "all" || article.category_id === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    } catch (error) {
      console.error("Error filtering article:", article, error);
      return false; // Exclude problematic articles from results
    }
  });

  if (!canManageArticles) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <PackagePlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500">
            You don't have permission to manage articles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📦 Liste des articles
            </h1>
            <p className="text-gray-600 text-sm">
              Gérez tous les articles du système avec facilité
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowAddModal(true)}
          >
            <PackagePlus className="h-5 w-5 mr-2" />
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Fixed Search and Filter Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-[88px] z-10">
        <Card className="p-4 shadow-sm border-0 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="🔍 Rechercher par nom, description ou collisage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative group">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400 transition-all duration-200 min-w-[180px] group-hover:shadow-md"
                >
                  <option value="all">🏷️ Tous les types</option>
                  <option value="catering">🍽️ Catering</option>
                  <option value="sonodis">📦 Sonodis</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative group">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400 transition-all duration-200 min-w-[200px] group-hover:shadow-md"
                >
                  <option value="all">📂 Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      📁 {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative shadow-sm">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 right-0 px-2 py-1 text-red-700 hover:text-red-900"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <Card className="h-full shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <div className="h-full overflow-auto">
            <ArticlesTable
              articles={filteredArticles}
              loading={loading}
              onEdit={(article: Article) => setSelectedArticle(article)}
              onDelete={(article: Article) => setSelectedArticle(article)}
            />
          </div>
        </Card>
      </div>

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh]">
            <ArticleFormModal
              onClose={() => setShowAddModal(false)}
              onSave={handleCreateArticle}
              categories={categories}
              mode="add"
            />
          </div>
        </div>
      )}

      {/* Edit/Delete Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh]">
            <ArticleFormModal
              onClose={() => setSelectedArticle(null)}
              onSave={(data) => handleUpdateArticle(selectedArticle.id, data)}
              onDelete={() => handleDeleteArticle(selectedArticle.id)}
              categories={categories}
              initialData={selectedArticle}
              mode="edit"
            />
          </div>
        </div>
      )}
    </div>
  );
}
