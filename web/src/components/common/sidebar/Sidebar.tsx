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
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../ui/button";

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
    <a
      href={href}
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
    </a>
  );
};

export const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const { logout } = useAuth();

  const toggleDeliveryMenu = () => setDeliveryOpen(!deliveryOpen);

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
        "z-10 shadow-lg",
        // Desktop: always visible, width changes
        "hidden md:flex",
        isOpen ? "w-64" : "w-20",
        // Mobile: only visible when open, full width
        "md:relative"
      )}
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
            <SidebarItem
              icon={<FileText className="h-5 w-5" />}
              label="Bon de commande"
              href="/bon-de-commande"
            />

            <div className="space-y-2">
              <div
                onClick={toggleDeliveryMenu}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer",
                  "hover:bg-green-100/80 text-black hover:text-green-800",
                  "select-none border border-transparent hover:border-green-200 transition-all duration-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Bon de livraison</span>
                </div>
                {deliveryOpen ? (
                  <ChevronDown className="h-4 w-4 text-green-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-green-600" />
                )}
              </div>

              {deliveryOpen && (
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

            <SidebarItem
              icon={<Users className="h-5 w-5" />}
              label="User Management"
              href="/user-management"
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center pt-12 space-y-4">
          <a
            href="/bon-de-commande"
            className="p-2 hover:bg-green-100/80 rounded-lg text-green-600 transition-colors"
          >
            <FileText className="h-5 w-5" />
          </a>
          <button
            onClick={toggleDeliveryMenu}
            className="p-2 hover:bg-green-100/80 rounded-lg text-green-600 transition-colors"
          >
            <Truck className="h-5 w-5" />
          </button>
          {deliveryOpen && (
            <div className="flex flex-col items-center space-y-2">
              <a
                href="/affectation-ressources"
                className="p-1 hover:bg-green-100/80 rounded-lg text-green-600 text-xs transition-colors"
                title="Affectation des ressources"
              >
                <Settings className="h-4 w-4" />
              </a>
              <a
                href="/listes-bonnes-commande"
                className="p-1 hover:bg-green-100/80 rounded-lg text-green-600 text-xs transition-colors"
                title="Listes des bonnes de commande"
              >
                <List className="h-4 w-4" />
              </a>
            </div>
          )}
          <a
            href="/user-management"
            className="p-2 hover:bg-green-100/80 rounded-lg text-green-600 transition-colors"
          >
            <Users className="h-5 w-5" />
          </a>
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
