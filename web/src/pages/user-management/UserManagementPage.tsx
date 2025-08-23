import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserManagementPage() {
  const location = useLocation();

  const tabs = [
    {
      name: "Utilisateurs",
      href: "/user-management/users",
      icon: Users,
      current: location.pathname === "/user-management/users",
    },
    {
      name: "Rôles",
      href: "/user-management/roles",
      icon: Shield,
      current: location.pathname === "/user-management/roles",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des utilisateurs
        </h1>
        <p className="text-gray-600">
          Gérez les utilisateurs et les rôles de votre application
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={cn(
                  "group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm",
                  tab.current
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon
                  className={cn(
                    "mr-2 h-4 w-4",
                    tab.current
                      ? "text-green-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
