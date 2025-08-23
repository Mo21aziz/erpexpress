import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Role } from "@/types/database";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UserFormCardProps {
  title?: string;
  onClose: () => void;
  onSave: (userData: { 
    username: string; 
    email: string; 
    role_id: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  roles: Role[];
  className?: string;
  initialData?: {
    username: string;
    email: string;
    role_id: string;
    password: string;
    confirmPassword: string;
  };
  isEditing?: boolean;
}

export const UserFormCard = ({ 
  onClose, 
  onSave, 
  roles, 
  className,
  initialData,
  isEditing = false
}: UserFormCardProps) => {
  const [formData, setFormData] = useState(initialData || {
    username: "",
    email: "",
    role_id: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({
    password: "",
    general: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = { password: "", general: "" };
    let valid = true;

    if (!isEditing && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords don't match";
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
    } catch (err) {
      setErrors({
        ...errors,
        general: "Failed to save user. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{isEditing ? "Edit User" : "Add New User"}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!isEditing}
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required={!isEditing}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="role_id">Role</Label>
            <select
              id="role_id"
              value={formData.role_id}
              onChange={(e) => setFormData({...formData, role_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};