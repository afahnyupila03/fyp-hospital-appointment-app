"use client";

import { usePatientsData } from "@/hooks/useAdmin";
import Link from "next/link";

export default function PatientsHomePage() {
  const { data, isLoading, isError, error, refetch } = usePatientsData();

  if (isLoading) return <p>Loading patients data</p>;
  if (isError) return <p>Error loading patients, {error.message}</p>;

  return (
    <div>
      {data?.patients?.map((patients) => (
        <div key={patients._id}>
          <p>Name: {patients.name}</p>
          <p>Email: {patients.email}</p>
          <p>Booked appointments: ({patients?.appointments.length})</p>
          <Link href={`/admin/dashboard/patients/${patients._id}`}>
            View Profile
          </Link>
        </div>
      ))}
    </div>
  );
}
