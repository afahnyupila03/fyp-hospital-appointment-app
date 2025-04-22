"use client";

import { getPatientService } from "@/api/admin/patientManagementService";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "./appointments";

export const PatientId = ({ id }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientService(id),
    enabled: !!id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;

  const { _id, appointments, notifications, name, email } = data;

  return (
    <div>
      <p>_id: {_id}</p>
      <p>id: {id}</p>
      <p>name: {name}</p>
      <p>Email: {email}</p>

      <h3>Appointments</h3>
      <Appointment id={id} appointments={appointments} />
    </div>
  );
};
