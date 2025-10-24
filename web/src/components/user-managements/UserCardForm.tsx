import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Role } from "@/types/database";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { users } from "@/api/users";
import { Checkbox } from "@/components/ui/checkbox";

interface UserFormCardProps {
  title?: string;
  onClose: () => void;
  onSave: (userData: {
    username: string;
    email: string;
    role_id: string;
    password: string;
    confirmPassword: string;
    assigned_employee_ids?: string[];
  }) => Promise<void>;
  roles: Role[];
  className?: string;
  initialData?: {
    username: string;
    email: string;
    role_id: string;
    password: string;
    confirmPassword: string;
    assigned_employee_ids?: string[];
  };
  isEditing?: boolean;
}

interface Employee {
  id: string;
  username: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const UserFormCard = ({
  onClose,
  onSave,
  roles,
  className,
  initialData,
  isEditing = false,
}: UserFormCardProps) => {
  const [formData, setFormData] = useState(
    initialData || {
      username: "",
      email: "",
      role_id: "",
      password: "",
      confirmPassword: "",
      assigned_employee_ids: [],
    }
  );

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    general: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch employees when component mounts or when role changes to Gerant
  useEffect(() => {
    const fetchEmployees = async () => {
      if (formData.role_id) {
        const selectedRole = roles.find((role) => role.id === formData.role_id);
        if (selectedRole?.name === "Gerant") {
          setLoadingEmployees(true);
          try {
            const employeesData = await users.getEmployees();
            console.log("Fetched employees:", employeesData); // Debug log
            setEmployees(employeesData);
          } catch (error) {
            console.error("Failed to fetch employees:", error);
          } finally {
            setLoadingEmployees(false);
          }
        } else {
          setEmployees([]);
        }
      }
    };

    fetchEmployees();
  }, [formData.role_id, roles]);

  const validate = () => {
    const newErrors = {
      username: "",
      email: "",
      role: "",
      password: "",
      general: "",
    };
    let valid = true;

    // Validate required fields
    if (!formData.username?.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!formData.role_id) {
      newErrors.role = "Role is required";
      valid = false;
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

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
      console.log("Submitting form data:", formData); // Debug log
      await onSave(formData);
    } catch (err) {
      setErrors({
        ...errors,
        general: "Failed to save user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assigned_employee_ids: prev.assigned_employee_ids?.includes(employeeId)
        ? prev.assigned_employee_ids.filter((id) => id !== employeeId)
        : [...(prev.assigned_employee_ids || []), employeeId],
    }));
  };

  const selectedRole = roles.find((role) => role.id === formData.role_id);
  const isGerantRole = selectedRole?.name === "Gerant";

  return (
    <Card
      className={cn("w-full max-w-md max-h-[90vh] flex flex-col", className)}
    >
      <CardHeader className="flex flex-row justify-between items-center flex-shrink-0">
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

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">nom d'utilisateur</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
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
              onChange={(e) =>
                setFormData({ ...formData, role_id: e.target.value })
              }
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

          {/* Employee Assignment Section for Gerant Role */}
          {isGerantRole && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">
                Assigner des employés
              </Label>
              <p className="text-xs text-gray-600">
                Sélectionnez les employés que ce gérant va gérer :
              </p>

              {loadingEmployees ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    chargement des employés...
                  </p>
                </div>
              ) : employees.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun employé disponible</p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-3">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={
                          formData.assigned_employee_ids?.includes(
                            employee.user?.id || employee.id
                          ) || false
                        }
                        onCheckedChange={() =>
                          handleEmployeeToggle(employee.user?.id || employee.id)
                        }
                      />
                      <Label
                        htmlFor={`employee-${employee.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">
                          {employee.user?.username || employee.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.user?.email || employee.email}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>

      {/* Fixed footer with buttons */}
      <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50 flex-shrink-0">
        <Button variant="ghost" type="button" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Enregistrement en cours..." : "enregistrer"}
        </Button>
      </div>
    </Card>
  );
};
