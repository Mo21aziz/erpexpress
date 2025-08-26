import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
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
  const { toast } = useToast();
  const { user } = useAuth();
  const canManageCategories =
    user && user.role ? canAccessAdminPages(user.role.name) : false;

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
          <div className="p-3 bg-gradient-to-r from-green-600 to-red-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Affectation des ressources
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
    <div className="space-y-6 relative">
      {/* Date display in top right */}
      <div className="absolute top-0 right-0 z-10">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-sm font-medium text-blue-800">{currentDate}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-green-600 to-red-600 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Affectation des ressources
          </h1>
          <p className="text-gray-600">
            Gérez les catégories de ressources et leur affectation
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          />
        ))}

        {canManageCategories && (
          <AddCategoryButton onClick={handleAddCategory} />
        )}
      </div>

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
