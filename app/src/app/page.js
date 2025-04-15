"use client";

import { AppState } from "@/store/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = AppState();

  const router = useRouter();

  useEffect(() => {
    // If not authenticated, go to patient login. default case.
    if (!isAuthenticated()) {
      router.replace("/auth/patient");
      return;
    }

    // get last authenticated user role from localStorage.
    const role = localStorage.getItem("role");

    // Define dashboard routes for each role
    const routes = {
      admin: "/dashboard/admin",
      doctor: "/dashboard/doctor",
      patient: "/dashboard/patient",
    };

    // If roles exist and route is known, navigate there.
    if (role && routes[role]) {
      router.replace(routes[role]);
    } else {
      // fallback if role is missing or unrecognized
      router.replace("/auth/patient");
    }
  }, []);

  return null; // Don’t render anything while redirecting
}
