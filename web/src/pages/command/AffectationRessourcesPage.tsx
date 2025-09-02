import { useState, useEffect } from "react";
import { Settings, Calendar } from "lucide-react";
import { CategoryCard } from "../../components/affectation-ressources/CategoryCard";
import { AddCategoryButton } from "../../components/affectation-ressources/AddCategoryButton";
import { CategoryModal } from "../../components/affectation-ressources/CategoryModal";
import { CategoryArticlesModal } from "../../components/affectation-ressources/CategoryArticlesModal";
import { Category } from "@/types/database";
import { categories as categoriesApi } from "@/api/categoty";
import { articles as articlesApi } from "@/api/articles";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPages } from "@/utils/roleUtils";
import { Input } from "@/components/ui/input";
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

interface CategoryWithStats extends Category {
  resourceCount: number;
  assignedCount: number;
}

export function AffectationRessourcesPage() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithStats | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryWithStats | null>(null);
  const [cascadeDeleteDialogOpen, setCascadeDeleteDialogOpen] = useState(false);
  const [articlesModalOpen, setArticlesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageCategories =
    user && user.role ? canAccessAdminPages(user.role.name) : false;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Function to handle date change with validation
  const handleDateChange = (date: string) => {
    if (date < today) {
      toast({
        title: "❌ Date invalide",
        description: "Vous ne pouvez pas sélectionner une date dans le passé.",
        variant: "destructive",
      });
      return;
    }
    setSelectedDate(date);
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getCategories();

      // Get actual article counts for each category
      const categoriesWithStats: CategoryWithStats[] = await Promise.all(
        data.map(async (category) => {
          try {
            const articles = await articlesApi.getArticlesByCategory(
              category.id
            );
            return {
              ...category,
              resourceCount: articles.length, // Actual number of articles
              assignedCount: 0, // Keep as 0 since we're not using it anymore
            };
          } catch (error) {
            console.error(
              `Error fetching articles for category ${category.id}:`,
              error
            );
            return {
              ...category,
              resourceCount: 0,
              assignedCount: 0,
            };
          }
        })
      );

      setCategories(categoriesWithStats);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to load categories"
          : "Failed to load categories";
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
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setModalMode("add");
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      setEditingCategory(category);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  const handleCategoryClick = (category: CategoryWithStats) => {
    if (!selectedDate) {
      toast({
        title: "❌ Date requise",
        description:
          "Veuillez sélectionner une date avant d'ouvrir une catégorie.",
        variant: "destructive",
      });
      return;
    }

    setSelectedCategory({
      id: category.id,
      name: category.name,
      description: category.description,
    });
    setArticlesModalOpen(true);
  };

  const handleDeleteCategory = (category: CategoryWithStats) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesApi.deleteCategory(categoryToDelete.id);
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to delete category"
          : "Failed to delete category";

      // Check if the error is about associated data
      if (
        message.includes("associated articles") ||
        message.includes("associated bon de commande")
      ) {
        // Automatically use cascade delete when there are bon de commande entries
        try {
          await categoriesApi.deleteCategory(categoryToDelete.id, true); // cascade = true
          setCategories(
            categories.filter((cat) => cat.id !== categoryToDelete.id)
          );
          toast({
            title: "Success",
            description:
              "Category and all associated data deleted successfully",
          });
        } catch (cascadeErr: unknown) {
          const cascadeMessage =
            cascadeErr instanceof AxiosError
              ? cascadeErr.response?.data?.error ||
                "Failed to delete category with cascade"
              : "Failed to delete category with cascade";
          toast({
            title: "Error",
            description: cascadeMessage,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const confirmCascadeDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesApi.deleteCategory(categoryToDelete.id, true); // cascade = true
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      toast({
        title: "Success",
        description: "Category and all associated data deleted successfully",
      });
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to delete category"
          : "Failed to delete category";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCascadeDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmitCategory = async (categoryData: { name: string }) => {
    try {
      if (modalMode === "add") {
        const newCategory = await categoriesApi.createCategory({
          ...categoryData,
          description: "", // Provide empty string for optional field
        });
        const categoryWithStats: CategoryWithStats = {
          ...newCategory,
          resourceCount: 0, // New category starts with 0 articles
          assignedCount: 0,
        };
        setCategories([...categories, categoryWithStats]);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      } else if (editingCategory) {
        const updatedCategory = await categoriesApi.updateCategory(
          editingCategory.id,
          {
            ...categoryData,
            description: "", // Provide empty string for optional field
          }
        );
        // Keep the existing article count when updating
        const categoryWithStats: CategoryWithStats = {
          ...updatedCategory,
          resourceCount: editingCategory.resourceCount,
          assignedCount: editingCategory.assignedCount,
        };
        setCategories(
          categories.map((cat) =>
            cat.id === editingCategory.id ? categoryWithStats : cat
          )
        );
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to save category"
          : "Failed to save category";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="  to-red-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Affectation des bons de commande
            </h1>
            <p className="text-gray-600">
              Gérez les catégories de ressources et leur affectation
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Main Title */}
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Affectation des bons de commande
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Gérez les catégories de ressources et leur affectation
            </p>
          </div>
        </div>

        {/* Date display in top right - responsive */}
        <div className="flex justify-end">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
            <p className="text-sm font-medium text-blue-800">{currentDate}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Categories Container with Border and Date Selector */}
      <div className="bg-gradient-to-br from-white via-green-50 to-red-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Date Selector - Responsive */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-50 to-red-50 border-2 border-green-200 rounded-xl p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Date Selector */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-red-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="date-selector"
                    className="text-sm font-semibold text-green-800 mb-2"
                  >
                    📅 Sélectionnez une date cible *
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="date-selector"
                      type="date"
                      value={selectedDate}
                      min={today}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500 text-sm"
                      required
                    />
                    {selectedDate && (
                      <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        {new Date(selectedDate).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Required Warning */}
              {!selectedDate && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    ⚠️ Date requise pour continuer
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Section Title */}
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center space-x-2 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-green-300 to-green-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Catégories de ressources
            </h2>
            <div className="w-8 h-1 bg-gradient-to-r from-red-300 to-red-400 rounded-full"></div>
          </div>
          <p className="text-gray-600 text-sm">
            Sélectionnez une catégorie pour gérer les articles et créer des bons
            de commande
          </p>
        </div>

        {/* Categories Grid - Only show when date is selected */}
        {selectedDate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 relative">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400 via-white to-red-400 rounded-2xl"></div>
            </div>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description || ""}
                resourceCount={category.resourceCount}
                assignedCount={category.assignedCount}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onClick={() => handleCategoryClick(category)}
                selectedDate={selectedDate}
              />
            ))}

            {canManageCategories && (
              <AddCategoryButton onClick={handleAddCategory} />
            )}
          </div>
        ) : (
          /* No Date Selected Message */
          <div className="mt-8 text-center py-12">
            <div className="max-w-lg mx-auto">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-green-600" />
                </div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mx-auto"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                📅 Date requise
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                <strong>Veuillez sélectionner une date cible</strong> dans le
                sélecteur ci-dessus pour :
              </p>
              <ul className="text-gray-500 text-sm mt-4 space-y-1">
                <li>• Voir les catégories disponibles</li>
                <li>• Créer des bons de commande</li>
                <li>• Gérer les articles et quantités</li>
              </ul>
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Astuce :</strong> La date doit être aujourd'hui ou
                  dans le futur
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="bg-gradient-to-r from-green-50 to-red-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-4">
            Statistiques d'affectation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Catégories totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {categories.reduce((sum, cat) => sum + cat.resourceCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Ressources totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categories.reduce((sum, cat) => sum + cat.assignedCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Ressources assignées</div>
            </div>
          </div>
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitCategory}
        initialData={
          editingCategory
            ? {
                name: editingCategory.name,
              }
            : undefined
        }
        mode={modalMode}
      />

      {/* Category Articles Modal */}
      <CategoryArticlesModal
        isOpen={articlesModalOpen}
        onClose={() => {
          setArticlesModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        selectedDate={selectedDate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone and will
              permanently remove the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cascade Delete Confirmation Dialog */}
      <AlertDialog
        open={cascadeDeleteDialogOpen}
        onOpenChange={(open) => {
          setCascadeDeleteDialogOpen(open);
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Category with Associated Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              The category "{categoryToDelete?.name}" has associated articles
              and/or bon de commande entries. Deleting this category will also
              permanently delete all associated data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCascadeDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCascadeDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
