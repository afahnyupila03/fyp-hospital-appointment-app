"use client";

import { AppState } from "@/store/context";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useProtectedRoute() {
  const { isAuthenticated } = AppState();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const authRoutes = {
      admin: "/auth/admin",
      doctor: "/auth/doctor",
      patient: "/auth/patient",
    };

    if (!token || !role) {
      // NO token or role - send patient login by default
      router.replace(authRoutes[role] || authRoutes["patient"]);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token expired get redirect route first
        const redirectRoute = authRoutes[role] || authRoutes["patient"];

        // token expired - clear and redirect based on role
        localStorage.removeItem("token");

        router.replace(redirectRoute);
      }
    } catch (error) {
      // Invalid token — clear and redirect
      const redirectRoute = authRoutes[role] || authRoutes["patient"];

      localStorage.removeItem("token");

      router.replace(redirectRoute);
    }
  }, [router, isAuthenticated]);
}
