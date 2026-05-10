import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute, GuestRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";

function AuthInit({ children }: { children: React.ReactNode }) {
  const { fetchMe, isAuthenticated } = useAuthStore();
  useEffect(() => {
    // On app load, if we have a token stored, rehydrate user from /me
    const token = localStorage.getItem("accessToken");
    if (token && isAuthenticated) fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit>
          <Routes>
            {/* Public redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Guest-only routes (redirect if already logged in) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Chunk 4+ routes will be added here */}
              <Route path="/trips" element={<div className="page-placeholder">Trips coming in Chunk 4 ✈️</div>} />
              <Route path="/explore" element={<div className="page-placeholder">Explore coming soon 🗺️</div>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
