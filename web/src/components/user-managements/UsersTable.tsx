import { User, Role, UserWithRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsersTableProps {
  users: UserWithRole[];
  loading: boolean;
  onEdit: (user: UserWithRole) => void;
  onDelete: (user: UserWithRole) => void;
}

export const UsersTable = ({
  users,
  loading,
  onEdit,
  onDelete,
}: UsersTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <UserIcon className="mx-auto h-8 w-8 mb-2" />
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom d'utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800"
                >
                  {user.role?.name || "No role"}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  Actif
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
