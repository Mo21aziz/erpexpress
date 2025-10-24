// src/components/ui/Header.tsx
import React from "react";
import { Menu, X } from "lucide-react";
import { UserProfile } from "../../ui/user-profile";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { ROLES } from "../../../utils/roleUtils";

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Header = ({ isSidebarOpen, toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Function to get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;

    switch (path) {
      case "/":
        return "Affectation des ressources";
      case "/affectation-ressources":
        return "Affectation des ressources";
      case "/listes-bonnes-commande":
        return "Listes des bons de commande";
      case "/coming-soon":
        return "Bientôt disponible";
      case "/user-management":
        return "Gestion des utilisateurs";
      default:
        return "Affectation des ressources";
    }
  };

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
        <h1 className="text-2xl font-bold text-black">{getPageTitle()}</h1>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
          <div className="w-4 h-4 bg-white border border-green-500 rounded-full shadow-sm"></div>
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Mobile title */}
      <div className="md:hidden flex items-center space-x-2">
        <h1 className="text-lg font-bold text-black">{getPageTitle()}</h1>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          <div className="w-3 h-3 bg-white border border-green-500 rounded-full shadow-sm"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
        </div>
      </div>

      {user ? (
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{user.role?.name || "Unknown"}</span>
          </div>
          <UserProfile name={user.username} />
        </div>
      ) : (
        <div className="text-gray-500">Non connecté</div>
      )}
    </header>
  );
};
