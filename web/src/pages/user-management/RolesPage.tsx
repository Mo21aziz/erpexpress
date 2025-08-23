import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RolesTable } from "@/components/user-managements/RolesTable";
import { RoleFormCard } from "@/components/user-managements/RoleFormCard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Role } from "@/types/database";
import { roles as rolesApi } from "@/api/roles";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

export function RolesPage() {
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesApi.getRoles();
      setRolesData(data);
      setError(null);
    } catch (err: unknown) {
      handleError(err, "Failed to load roles");
    } finally {
      setLoading(false);
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
    fetchRoles();
  }, []);

  const handleCreateRole = async (roleData: { name: string }) => {
    try {
      const newRole = await rolesApi.createRole(roleData);
      setRolesData((prev) => [...prev, newRole]);
      setShowAddModal(false);
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    } catch (err: unknown) {
      handleError(err, "Failed to create role");
      throw err;
    }
  };

  const handleUpdateRole = async (roleData: { name: string }) => {
    if (!selectedRole) return;

    try {
      const updatedRole = await rolesApi.updateRole(selectedRole.id, roleData);
      setRolesData((prev) =>
        prev.map((role) => (role.id === selectedRole.id ? updatedRole : role))
      );
      setSelectedRole(null);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    } catch (err: unknown) {
      handleError(err, "Failed to update role");
      throw err;
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      await rolesApi.deleteRole(role.id);
      setRolesData((prev) => prev.filter((r) => r.id !== role.id));
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (err: unknown) {
      handleError(err, "Failed to delete role");
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <Card className="p-6">
        <RolesTable
          roles={rolesData}
          loading={loading}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
        />
      </Card>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RoleFormCard
            title="Add New Role"
            onClose={handleCloseModal}
            onSave={handleCreateRole}
          />
        </div>
      )}

      {/* Edit Role Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RoleFormCard
            title="Edit Role"
            onClose={handleCloseModal}
            onSave={handleUpdateRole}
            initialData={{ name: selectedRole.name }}
            isEditing={true}
          />
        </div>
      )}
    </div>
  );
}
