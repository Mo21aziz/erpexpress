// src/components/ui/Header.tsx
import React from "react";
import { Menu, X } from "lucide-react";
import { UserProfile } from "../../ui/user-profile";
import { useAuth } from "../../../contexts/AuthContext";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Header = ({ isSidebarOpen, toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white via-green-50 to-red-50 border-b-2 border-green-200 shadow-lg">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Desktop title with Italian flag colors */}
      <div className="hidden md:flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
          <div className="w-4 h-4 bg-white border border-green-500 rounded-full shadow-sm"></div>
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
        </div>
      </div>

      {user ? (
        <UserProfile name={user.username} />
      ) : (
        <div className="text-gray-500">Non connecté</div>
      )}
    </header>
  );
};
