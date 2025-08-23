// src/components/common/sidebar/Sidebar.tsx
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./SidebarHeader";
import {
  FileText,
  Truck,
  Users,
  ChevronDown,
  ChevronRight,
  X,
  Settings,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { isAdmin, canAccessGerantPages } from "../../../utils/roleUtils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon,
  label,
  href,
  active = false,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center p-3 rounded-lg",
        "hover:bg-green-100/80 transition-all duration-200",
        "text-black hover:text-green-800",
        active && "bg-green-100 text-green-800 shadow-sm",
        "space-x-3 border border-transparent hover:border-green-200"
      )}
    >
      <span className="text-green-600">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [commandOpen, setCommandOpen] = useState(false);
  const [usersOpen, setusersopen] = useState(false);
  const { logout, user } = useAuth();

  // Check if user is admin
  const userIsAdmin = user && user.role ? isAdmin(user.role.name) : false;
  // Check if user can access gerant pages
  const userCanAccessGerantPages = user && user.role ? canAccessGerantPages(user.role.name) : false;

  // Debug logging
  console.log("User:", user);
  console.log("User role:", user?.role);
  console.log("User role name:", user?.role?.name);
  console.log("Is admin:", userIsAdmin);
  console.log("Can access gerant pages:", userCanAccessGerantPages);

  const toggleCommandMenu = () => setCommandOpen(!commandOpen);
  const toggleUsersMenu = () => setusersopen(!usersOpen);

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={cn(
        "h-full",
        "bg-gradient-to-b from-white via-green-50 to-red-50",
        "border-r-2 border-green-200",
        "flex flex-col space-y-6 p-4",
        "transition-all duration-300 ease-in-out",
        "z-50 shadow-lg",
        // Desktop: always visible, width changes
        "flex",
        isOpen ? "w-64" : "w-20",
        // Mobile: only visible when open, full width
        "md:relative",
        "white" // Debug color
      )}
      style={{ minHeight: "100vh" }}
    >
      {/* Desktop toggle button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex items-center justify-center w-full p-3 rounded-lg hover:bg-green-100 text-green-600 transition-colors mb-4"
      >
        {isOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </button>

      {/* Mobile close button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {isOpen ? (
        <>
          <SidebarHeader />
          <div className="flex-1 space-y-3 mt-6">
            <div className="space-y-2">
              <div
                onClick={toggleCommandMenu}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer",
                  "hover:bg-green-100/80 text-black hover:text-green-800",
                  "select-none border border-transparent hover:border-green-200 transition-all duration-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Bon de commande</span>
                </div>
                {commandOpen ? (
                  <ChevronDown className="h-4 w-4 text-green-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-green-600" />
                )}
              </div>

              {commandOpen && (
                <div className="pl-8 space-y-2 bg-green-50/50 rounded-lg p-2 border-l-2 border-green-200">
                  <SidebarItem
                    icon={<Settings className="h-4 w-4" />}
                    label="Affectation des ressources"
                    href="/affectation-ressources"
                  />
                  <SidebarItem
                    icon={<List className="h-4 w-4" />}
                    label="Listes des bonnes de commande"
                    href="/listes-bonnes-commande"
                  />
                </div>
              )}
            </div>

            {userIsAdmin && (
              <SidebarItem
                icon={<Truck className="h-5 w-5" />}
                label="Bon de livraison"
                href="/coming-soon"
              />
            )}

            {userIsAdmin && (
              <div className="space-y-2">
                <div
                  onClick={toggleUsersMenu}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer",
                    "hover:bg-green-100/80 text-black hover:text-green-800",
                    "select-none border border-transparent hover:border-green-200 transition-all duration-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="font-medium">User Management</span>
                  </div>
                  {usersOpen ? (
                    <ChevronDown className="h-4 w-4 text-green-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  )}
                </div>

                {usersOpen && (
                  <div className="pl-8 space-y-2 bg-green-50/50 rounded-lg p-2 border-l-2 border-green-200">
                    <SidebarItem
                      icon={<User className="h-4 w-4" />}
                      label="Utilisateur"
                      href="/user-management/users"
                    />
                    <SidebarItem
                      icon={<Shield className="h-4 w-4" />}
                      label="Role"
                      href="/user-management/roles"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center pt-12 space-y-4">
          <button
            onClick={toggleCommandMenu}
            className="p-2 hover:bg-green-100/80 rounded-lg text-green-600 transition-colors"
            title="Bon de commande"
          >
            <FileText className="h-5 w-5" />
          </button>
          {commandOpen && (
            <div className="flex flex-col items-center space-y-2">
              <Link
                to="/affectation-ressources"
                className="p-1 hover:bg-green-100/80 rounded-lg text-green-600 text-xs transition-colors"
                title="Affectation des ressources"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <Link
                to="/listes-bonnes-commande"
                className="p-1 hover:bg-green-100/80 rounded-lg text-green-600 text-xs transition-colors"
                title="Listes des bonnes de commande"
              >
                <List className="h-4 w-4" />
              </Link>
            </div>
          )}
          {userIsAdmin && (
            <Link
              to="/coming-soon"
              className="p-2 hover:bg-green-100/80 rounded-lg text-green-600 transition-colors"
              title="Bon de livraison"
            >
              <Truck className="h-5 w-5" />
            </Link>
          )}
          {userIsAdmin && (
            <button
              onClick={toggleUsersMenu}
              className="p-2 hover:bg-green-100/80 rounded-lg text-green-600 transition-colors"
              title="User Management"
            >
              <Users className="h-5 w-5" />
            </button>
          )}
          {userIsAdmin && usersOpen && (
            <div className="flex flex-col items-center space-y-2">
              <Link
                to="/user-management/users"
                className="p-1 hover:bg-green-100/80 rounded-lg text-green-600 text-xs transition-colors"
                title="Utilisateur"
              >
                <User className="h-4 w-4" />
              </Link>
              <Link
                to="/user-management/roles"
                className="p-1 hover:bg-green-100/80 rounded-lg text-green-600 text-xs transition-colors"
                title="Role"
              >
                <Shield className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Disconnect Button and Italian Flag - Different for open/closed states */}
      {isOpen ? (
        <div className="pb-4 space-y-4">
          {/* Disconnect Button - Full version */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>

          {/* Italian Flag Indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-white border-2 border-green-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
          </div>
        </div>
      ) : (
        <div className="pb-4 flex flex-col items-center space-y-4">
          {/* Disconnect Button - Icon only */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-100/80 rounded-lg text-red-600 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* Italian Flag Indicator - Smaller */}
          <div className="flex items-center justify-center space-x-1 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-white border border-green-500 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
          </div>
        </div>
      )}
    </div>
  );
};
