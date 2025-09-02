import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Package } from "lucide-react";
import { Article } from "@/types/database";
import { articles as articlesApi } from "@/api/articles";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: Article) => void;
  categoryId: string;
  initialData?: Partial<Article>;
  mode: "add" | "edit";
}

export function ArticleFormModal({
  isOpen,
  onClose,
  onSubmit,
  categoryId,
  initialData,
  mode,
}: ArticleFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    collisage: "",
    type: "catering",
    numero: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    collisage: "",
    type: "",
    numero: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        price: initialData.price ? Number(initialData.price).toString() : "",
        collisage: initialData.collisage || "",
        type: initialData.type || "catering",
        numero:
          initialData.numero !== undefined && initialData.numero !== null
            ? String(initialData.numero)
            : "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        collisage: "",
        type: "catering",
        numero: "",
      });
    }
    setErrors({
      name: "",
      price: "",
      collisage: "",
      type: "",
      numero: "",
      general: "",
    });
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {
      name: "",
      price: "",
      collisage: "",
      type: "",
      numero: "",
      general: "",
    };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Article name is required";
      valid = false;
    }

    if (!formData.collisage.trim()) {
      newErrors.collisage = "Collisage is required";
      valid = false;
    }

    if (!formData.type) {
      newErrors.type = "Article type is required";
      valid = false;
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a valid number";
      valid = false;
    }

    if (formData.price && Number(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
      valid = false;
    }

    if (
      formData.numero &&
      (isNaN(Number(formData.numero)) || Number(formData.numero) < 0)
    ) {
      newErrors.numero = "Numero must be a positive number";
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
        description: "", // Provide empty string for optional field
        price: formData.price ? Number(formData.price) : 0,
        collisage: formData.collisage.trim(),
        type: formData.type,
        numero: formData.numero ? Number(formData.numero) : undefined,
        category_id: categoryId,
      };

      let result: Article;
      if (mode === "add") {
        result = await articlesApi.createArticle(articleData);
      } else {
        result = await articlesApi.updateArticle(initialData!.id!, articleData);
      }

      onSubmit(result);
      onClose();
      toast({
        title: "Success",
        description: `Article ${
          mode === "add" ? "created" : "updated"
        } successfully`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to save article"
          : "Failed to save article";
      setErrors({
        ...errors,
        general: message,
      });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">
              {mode === "add" ? "Add New Article" : "Edit Article"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Article Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter article name"
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Numero</Label>
            <Input
              id="numero"
              type="number"
              min="0"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
              placeholder="e.g., 1"
            />
            {errors.numero && (
              <p className="text-sm text-red-600">{errors.numero}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
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
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="collisage">Collisage</Label>
            <Input
              id="collisage"
              value={formData.collisage}
              onChange={(e) =>
                setFormData({ ...formData, collisage: e.target.value })
              }
              
              required
            />
            {errors.collisage && (
              <p className="text-sm text-red-600">{errors.collisage}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Article Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="catering">Catering</option>
              <option value="sonodis">Sonodis</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                ? "Create Article"
                : "Update Article"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
