// src/components/ui/user-profile.tsx
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

interface UserProfileProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  className?: string;
}

export const UserProfile = ({
  name,
  email,
  avatarUrl,
  className,
}: UserProfileProps) => {
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex items-center space-x-4 cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Avatar className="h-10 w-10">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-gradient-to-r from-green-600 to-red-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{name}</p>
          {email && <p className="text-sm text-gray-600">{email}</p>}
        </div>
      </div>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Profil</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};
