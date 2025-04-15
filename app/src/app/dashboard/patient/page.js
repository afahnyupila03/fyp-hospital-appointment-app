"use client";

import { AppState } from "@/store/context";

export default function PatientDashboard() {
  const { user, loading } = AppState();
  console.log("USER: ", user?.name);

  if (loading) return <div>Loading....</div>;

  return <h1>Patient dashboard page: {user ? user.name : "Not logged in"}</h1>;
}
