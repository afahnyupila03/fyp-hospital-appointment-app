"use client";

import useProtectedRoute from "@/app/useProtectedRoute";

export default function AdminDashboard() {
  useProtectedRoute();

  return <h1>Admin dashboard</h1>;
}
