"use client";

import { AppState } from "@/store/context";
// import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useProtectedRoute() {
  const { isAuthenticated } = AppState();
  const router = useRouter();

  useEffect(() => {
    // const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const authRoutes = {
      admin: "/admin/auth",
      doctor: "/doctor/auth",
      patient: "/patient/auth",
    };

    // Not authenticated? Redirect.
    if (!isAuthenticated()) {

      localStorage.removeItem('token')
      localStorage.removeItem('role')
      
      router.replace(authRoutes[role] || authRoutes["patient"]);
      
    }

    
  }, [isAuthenticated, user, router]);
}
