// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Signin } from "@/components/Auth/Signin";
import { ComingSoon } from "@/components/ComingSoon";
import { AffectationRessourcesPage } from "@/pages/command/AffectationRessourcesPage";
import { ListesBonnesCommandePage } from "@/pages/command/ListesBonnesCommandePage";
import { UserManagementPage } from "@/pages/user-management/UserManagementPage";
import { UsersPage } from "@/pages/user-management/UsersPage";
import { RolesPage } from "@/pages/user-management/RolesPage";
import { ArticlesListPage } from "@/pages/ArticlesListPage";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/Auth/RoleBasedRoute";
import { SigninRedirect } from "@/components/Auth/SigninRedirect";

export const router = createBrowserRouter([
  {
    path: "/signin",
    element: (
      <SigninRedirect>
        <Signin />
      </SigninRedirect>
    ),
  },
  {
    path: "/coming-soon",
    element: <ComingSoon />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleBasedRoute
            allowedRoles={["Admin", "Responsible"]}
            fallbackPath="/listes-bonnes-commande"
          >
            <AffectationRessourcesPage />
          </RoleBasedRoute>
        ),
      },
      {
        path: "affectation-ressources",
        element: (
          <RoleBasedRoute
            allowedRoles={["Admin", "Responsible"]}
            fallbackPath="/listes-bonnes-commande"
          >
            <AffectationRessourcesPage />
          </RoleBasedRoute>
        ),
      },
      {
        path: "listes-bonnes-commande",
        element: <ListesBonnesCommandePage />,
      },
      {
        path: "articles",
        element: (
          <RoleBasedRoute allowedRoles={["Admin", "Responsible"]}>
            <ArticlesListPage />
          </RoleBasedRoute>
        ),
      },
      {
        path: "user-management",
        element: (
          <RoleBasedRoute allowedRoles={["Admin", "Responsible"]}>
            <UserManagementPage />
          </RoleBasedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/user-management/users" replace />,
          },
          {
            path: "users",
            element: (
              <RoleBasedRoute allowedRoles={["Admin", "Responsible"]}>
                <UsersPage />
              </RoleBasedRoute>
            ),
          },
          {
            path: "roles",
            element: (
              <RoleBasedRoute allowedRoles={["Admin", "Responsible"]}>
                <RolesPage />
              </RoleBasedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
