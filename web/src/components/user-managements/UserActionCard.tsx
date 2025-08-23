import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, X } from "lucide-react";
import { User, Role } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
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
  roles 
}: UserActionsCardProps) => {
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await users.deleteUser(user.id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      onUserUpdated();
      onClose();
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
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row justify-between items-center">
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

          <CardContent className="space-y-6">
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
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Name:</span> {user.username}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Role:</span> {user.role?.name || "None"}</p>
                <p><span className="font-medium">Status:</span> Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <UserFormCard
          title="Edit User"
          onClose={() => setShowEditForm(false)}
          onSave={async (formData) => {
            try {
              await users.updateUser(user.id, {
                username: formData.username,
                email: formData.email,
                role_id: formData.role_id
              });
              toast({
                title: "Success",
                description: "User updated successfully",
              });
              onUserUpdated();
              setShowEditForm(false);
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to update user",
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
            confirmPassword: ""
          }}
          isEditing
        />
      )}

      {/* Centered Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account.
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