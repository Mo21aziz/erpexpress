import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export const RoleBasedRoute = ({
  children,
  allowedRoles,
  fallbackPath = "/affectation-ressources",
}: RoleBasedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has the required role
  console.log("RoleBasedRoute - User:", user);
  console.log("RoleBasedRoute - User role:", user?.role);
  console.log("RoleBasedRoute - Allowed roles:", allowedRoles);
  console.log("RoleBasedRoute - User role name:", user?.role?.name);

  if (!user || !user.role || !allowedRoles.includes(user.role.name)) {
    console.log(
      "RoleBasedRoute - Access denied, redirecting to:",
      fallbackPath
    );
    return <Navigate to={fallbackPath} replace />;
  }

  console.log("RoleBasedRoute - Access granted");

  return <>{children}</>;
};
