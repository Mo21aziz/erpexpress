import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: { name: string; description: string }) => Promise<void>;
  initialData?: { name: string; description: string };
  mode: "add" | "edit";
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSubmit({ name: name.trim(), description: description.trim() });
        onClose();
      } catch (error) {
        // Error is handled by the parent component
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {mode === "add" ? "Ajouter une catégorie" : "Modifier la catégorie"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la catégorie</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Légumes, Fruits, Viandes..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la catégorie..."
              rows={3}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : mode === "add"
                ? "Ajouter"
                : "Modifier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
