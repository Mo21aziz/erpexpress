import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { UsersTable } from "@/components/user-managements/UsersTable";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { User, Role, UserWithRole } from "@/types/database";
import { users } from "@/api/users";
import { roles as rolesApi } from "@/api/roles";
import { UserFormCard } from "@/components/user-managements/UserCardForm";
import { UserActionsCard } from "@/components/user-managements/UserActionCard";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

export function UsersPage() {
  const [usersData, setUsersData] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await users.getUsers();
      setUsersData(data);
      setError(null);
    } catch (err: unknown) {
      handleError(err, "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await rolesApi.getRoles();
      setRoles(data);
    } catch (err: unknown) {
      handleError(err, "Failed to load roles");
    }
  };

  const handleError = (err: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (err instanceof AxiosError) {
      errorMessage = err.response?.data?.message || err.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    console.error(errorMessage);
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleAddUser = async (userData: {
    username: string;
    email: string;
    role_id: string;
    password: string;
    confirmPassword: string;
    assigned_employee_ids?: string[];
  }) => {
    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      await users.createUser({
        username: userData.username,
        email: userData.email,
        role_id: userData.role_id,
        password: userData.password,
        assigned_employee_ids: userData.assigned_employee_ids,
      });

      setShowAddModal(false);
      await fetchUsers();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (err: unknown) {
      handleError(err, "Failed to create user");
    }
  };

  const handleUserUpdated = async () => {
    await fetchUsers();
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Les utilisateurs</h1>
          <p className="text-gray-600">Gérer les comptes utilisateurs</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter utilisateur
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 right-0 px-2 py-1 text-red-700 hover:text-red-900"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <Card className="shadow-sm">
        <UsersTable
          users={usersData}
          loading={loading}
          onEdit={(user: UserWithRole) => setSelectedUser(user)}
          onDelete={(user: UserWithRole) => setSelectedUser(user)}
        />
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh]">
            <UserFormCard
              onClose={() => setShowAddModal(false)}
              onSave={handleAddUser}
              roles={roles}
            />
          </div>
        </div>
      )}

      {/* Edit/Delete User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh]">
            <UserActionsCard
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onUserUpdated={handleUserUpdated}
              roles={roles}
            />
          </div>
        </div>
      )}
    </div>
  );
}
