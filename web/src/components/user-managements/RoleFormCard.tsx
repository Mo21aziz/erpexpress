// components/user-managements/RoleFormCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface RoleFormCardProps {
  title?: string;
  onClose: () => void;
  onSave: (roleData: { name: string }) => Promise<void>;
  className?: string;
  initialData?: {
    name: string;
  };
  isEditing?: boolean;
}

export const RoleFormCard = ({
  title = "Add New Role",
  onClose,
  onSave,
  className,
  initialData,
  isEditing = false,
}: RoleFormCardProps) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
    }
  );

  const [errors, setErrors] = useState({
    name: "",
    general: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    const newErrors = { name: "", general: "" };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
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
      await onSave(formData);
      toast({
        title: "Success",
        description: `Role ${isEditing ? "updated" : "created"} successfully`,
      });
    } catch (err) {
      setErrors({
        ...errors,
        general: "Failed to save role. Please try again.",
      });
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className={cn("w-full max-w-md max-h-[90vh] flex flex-col", className)}
    >
      <CardHeader className="flex flex-row justify-between items-center flex-shrink-0">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du rôle</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </form>
      </CardContent>

      {/* Fixed footer with buttons */}
      <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50 flex-shrink-0">
        <Button variant="ghost" type="button" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "enregistrement en cours..." : "Enregistrer"}
        </Button>
      </div>
    </Card>
  );
};
