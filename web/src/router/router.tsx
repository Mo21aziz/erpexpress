// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Signin } from "@/components/Auth/Signin";
import { ComingSoon } from "@/components/ComingSoon";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
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
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
