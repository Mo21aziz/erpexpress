import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, X } from "lucide-react";
import { User, Role } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { UserFormCard } from "./UserCardForm";
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
import { users } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserActionsCardProps {
  user: User & { role: Role };
  onClose: () => void;
  onUserUpdated: () => void;
  roles: Role[];
}

export const UserActionsCard = ({
  user,
  onClose,
  onUserUpdated,
  roles,
}: UserActionsCardProps) => {
  const { toast } = useToast();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
  const [loadingAssignedEmployees, setLoadingAssignedEmployees] =
    useState(false);

  // Fetch assigned employees if user is a Gerant
  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      if (user.role?.name === "Gerant") {
        setLoadingAssignedEmployees(true);
        try {
          const employees = await users.getGerantAssignedEmployees(user.id);
          console.log("Fetched assigned employees:", employees); // Debug log
          setAssignedEmployees(employees);
        } catch (error) {
          console.error("Failed to fetch assigned employees:", error);
        } finally {
          setLoadingAssignedEmployees(false);
        }
      }
    };

    fetchAssignedEmployees();
  }, [user.id, user.role?.name]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await users.deleteUser(user.id);

      // Check if the deleted user is the current logged-in user
      const isCurrentUser = currentUser && currentUser.id === user.id;

      if (isCurrentUser) {
        // If deleting current user, log them out and redirect to signin
        toast({
          title: "Account Deleted",
          description:
            "Your account has been deleted. You will be logged out automatically.",
        });

        // Close the modal first
        onClose();

        // Logout and redirect after a short delay
        setTimeout(() => {
          logout();
          navigate("/signin");
        }, 1500);
      } else {
        // If deleting another user, show normal success message
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        onUserUpdated();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      {/* Main Card Content */}
      {!showEditForm ? (
        <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center flex-shrink-0">
            <CardTitle>Manage User</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowEditForm(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit User
              </Button>

              <Button
                variant="default"
                onClick={() => setShowDeleteDialog(true)}
                className={`flex items-center gap-2 ${
                  currentUser && currentUser.id === user.id
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : ""
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {currentUser && currentUser.id === user.id
                  ? "Delete My Account"
                  : "Delete User"}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Details</h4>
              {currentUser && currentUser.id === user.id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div className="text-sm text-yellow-800">
                      <strong>This is your account.</strong> Deleting it will
                      log you out immediately.
                    </div>
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Name:</span> {user.username}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {user.role?.name || "None"}
                </p>
                <p>
                  <span className="font-medium">Status:</span> Active
                </p>
              </div>
            </div>

            {/* Show assigned employees if user is a Gerant */}
            {user.role?.name === "Gerant" && (
              <div className="space-y-2">
                <h4 className="font-medium">Assigned Employees</h4>
                {loadingAssignedEmployees ? (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-1">Loading...</p>
                  </div>
                ) : assignedEmployees.length === 0 ? (
                  <p className="text-sm text-gray-500">No employees assigned</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {assignedEmployees.map((employee) => (
                      <div key={employee.id} className="text-sm text-gray-600">
                        •{" "}
                        {employee.user?.username ||
                          employee.username ||
                          "Unknown"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-md max-h-[90vh]">
          <UserFormCard
            title="Edit User"
            onClose={() => setShowEditForm(false)}
            onSave={async (formData) => {
              try {
                // Validate required fields
                if (!formData.username?.trim()) {
                  throw new Error("Username is required");
                }
                if (!formData.email?.trim()) {
                  throw new Error("Email is required");
                }
                if (!formData.role_id) {
                  throw new Error("Role is required");
                }

                const updateData = {
                  username: formData.username.trim(),
                  email: formData.email.trim(),
                  role_id: formData.role_id,
                  assigned_employee_ids: formData.assigned_employee_ids || [],
                };

                console.log("Updating user with data:", updateData); // Debug log
                console.log("User ID:", user.id); // Debug log

                await users.updateUser(user.id, updateData);
                toast({
                  title: "Success",
                  description: "User updated successfully",
                });
                onUserUpdated();
                setShowEditForm(false);
              } catch (error: any) {
                console.error("Error updating user:", error); // Debug log
                console.error("Error details:", {
                  message: error.message,
                  response: error.response?.data,
                  status: error.response?.status,
                });

                const errorMessage =
                  error.response?.data?.error ||
                  error.message ||
                  "Failed to update user";
                toast({
                  title: "Error",
                  description: errorMessage,
                  variant: "destructive",
                });
              }
            }}
            roles={roles}
            initialData={{
              username: user.username,
              email: user.email,
              role_id: user.role?.id || "",
              password: "",
              confirmPassword: "",
              assigned_employee_ids: assignedEmployees.map(
                (emp) => emp.user?.id || emp.id
              ),
            }}
            isEditing
          />
        </div>
      )}

      {/* Centered Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {currentUser && currentUser.id === user.id
                  ? "Delete Your Account?"
                  : "Are you absolutely sure?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {currentUser && currentUser.id === user.id ? (
                  <>
                    <strong className="text-red-600">⚠️ Warning:</strong> You
                    are about to delete your own account. This action cannot be
                    undone and you will be automatically logged out.
                  </>
                ) : (
                  "This action cannot be undone. This will permanently delete the user account."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      )}
    </>
  );
};
