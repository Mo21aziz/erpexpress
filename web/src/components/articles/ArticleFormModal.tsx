import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Package, Trash2 } from "lucide-react";
import { Article, Category } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
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

interface ArticleFormModalProps {
  onClose: () => void;
  onSave: (articleData: {
    name: string;
    description: string;
    price: number;
    collisage: string;
    type: string;
    numero?: number;
    category_id: string;
  }) => void;
  onDelete?: () => void;
  categories: Category[];
  initialData?: Partial<Article>;
  mode: "add" | "edit";
}

export function ArticleFormModal({
  onClose,
  onSave,
  onDelete,
  categories,
  initialData,
  mode,
}: ArticleFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    collisage: "",
    type: "catering",
    numero: "",
    category_id: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    collisage: "",
    type: "",
    numero: "",
    category_id: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price
          ? typeof initialData.price === "object" &&
            initialData.price !== null &&
            typeof initialData.price.toNumber === "function"
            ? initialData.price.toNumber().toString()
            : Number(initialData.price).toString()
          : "",
        collisage: initialData.collisage || "",
        type: initialData.type || "catering",
        numero:
          initialData.numero !== undefined && initialData.numero !== null
            ? String(initialData.numero)
            : "",
        category_id: initialData.category_id || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        collisage: "",
        type: "catering",
        numero: "",
        category_id: "",
      });
    }
    setErrors({
      name: "",
      price: "",
      collisage: "",
      type: "",
      numero: "",
      category_id: "",
      general: "",
    });
  }, [initialData]);

  const validate = () => {
    const newErrors = {
      name: "",
      price: "",
      collisage: "",
      type: "",
      numero: "",
      category_id: "",
      general: "",
    };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'article est requis";
      valid = false;
    }

    if (!formData.collisage.trim()) {
      newErrors.collisage = "Le collisage est requis";
      valid = false;
    }

    if (!formData.type) {
      newErrors.type = "Le type d'article est requis";
      valid = false;
    }

    if (!formData.category_id) {
      newErrors.category_id = "La catégorie est requise";
      valid = false;
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Le prix doit être un nombre valide";
      valid = false;
    }

    if (formData.price && Number(formData.price) < 0) {
      newErrors.price = "Le prix ne peut pas être négatif";
      valid = false;
    }

    if (
      formData.numero &&
      (isNaN(Number(formData.numero)) || Number(formData.numero) < 0)
    ) {
      newErrors.numero = "Le numéro doit être un nombre positif";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const articleData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price ? Number(formData.price) : 0,
        collisage: formData.collisage.trim(),
        type: formData.type,
        numero: formData.numero ? Number(formData.numero) : undefined,
        category_id: formData.category_id,
      };

      onSave(articleData);
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Échec de la sauvegarde de l'article"
          : "Échec de la sauvegarde de l'article";
      setErrors({
        ...errors,
        general: message,
      });
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-2xl border border-gray-200 h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "add"
                  ? "➕ Ajouter un article"
                  : "✏️ Modifier l'article"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === "add"
                  ? "Créez un nouvel article"
                  : "Modifiez les informations de l'article"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form
            id="article-form"
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {errors.general && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  <span className="font-medium">{errors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <span className="mr-2">📦</span>
                Nom de l'article *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Entrez le nom de l'article"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                required
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <span className="mr-2">📝</span>
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Entrez une description (optionnel)"
                rows={3}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="category_id"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <span className="mr-2">📂</span>
                Catégorie *
              </Label>
              <div className="relative group">
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400 transition-all duration-200 group-hover:shadow-md"
                  required
                >
                  <option value="">📂 Sélectionnez une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      📁 {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
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
              {errors.category_id && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.category_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="numero"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  <span className="mr-2">🔢</span>
                  Numéro
                </Label>
                <Input
                  id="numero"
                  type="number"
                  min="0"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  placeholder="e.g., 1"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                {errors.numero && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.numero}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="price"
                  className="text-sm font-semibold text-gray-700 flex items-center"
                >
                  <span className="mr-2">💰</span>
                  Prix 
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
                {errors.price && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="collisage"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <span className="mr-2">📊</span>
                Collisage *
              </Label>
              <Input
                id="collisage"
                value={formData.collisage}
                onChange={(e) =>
                  setFormData({ ...formData, collisage: e.target.value })
                }
                placeholder="e.g., 10"
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                required
              />
              {errors.collisage && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.collisage}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="type"
                className="text-sm font-semibold text-gray-700 flex items-center"
              >
                <span className="mr-2">🏷️</span>
                Type d'article *
              </Label>
              <div className="relative group">
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm appearance-none cursor-pointer hover:border-gray-400 transition-all duration-200 group-hover:shadow-md"
                  required
                >
                  <option value="catering">🍽️ Catering</option>
                  <option value="sonodis">📦 Sonodis</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
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
              {errors.type && (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.type}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex-shrink-0">
          <div>
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="article-form"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? "Sauvegarde..."
                : mode === "add"
                ? "Créer l'article"
                : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action ne
              peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
