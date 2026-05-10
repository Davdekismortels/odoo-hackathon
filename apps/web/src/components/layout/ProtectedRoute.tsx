import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = "/login" }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** Redirect logged-in users away from auth pages */
export function GuestRoute({ children, redirectTo = "/dashboard" }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
