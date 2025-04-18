"use client";

// import { getDoctors } from "@/admin/service";
import useProtectedRoute from "@/app/useProtectedRoute";
import { AdminMainMenu } from "@/utils/adminNav";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function AdminDashboard() {
  useProtectedRoute();

  const dashboardRoutes = AdminMainMenu();

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["doctors"],
  //   queryFn: getDoctors,
  // });

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error querying doctors</div>;
  // if (data) console.log("dashboard page: ", data);

  return <div></div>;
}
