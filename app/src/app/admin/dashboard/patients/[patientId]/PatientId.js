"use client";

import { usePatientData } from "@/hooks/useAdmin";
import Link from "next/link";

export const PatientId = ({ id }) => {
  const { data, isLoading, error, isError } = usePatientData(id)

  if (isLoading) return <p>Loading patient data</p>;
  if (isError) return <p>Error loading patient data, {error.message}</p>;

  const { name, email, appointments } = data;

  const appointmentCounter = appointments.length;
  if (appointmentCounter === 0) return <p>No appointments yet.</p>;
  console.log("appointments: ", appointments);
  
  return (
    <div>
      <h3>Patient Information</h3>
      <p>Name: {name}</p>
      <p>Email: {email}</p>

      <h3>Patient Appointments</h3>
      <p>Total appointments: {appointmentCounter}</p>

      {appointments.map((appointment) => (
        <div key={appointment._id}>
          <p>Appointment reason: {appointment.reason}</p>
          <p>Appointment notes: {appointment.notes}</p>
          <Link
            href={`/admin/dashboard/patients/${id}/appointments/${appointment._id}`}
          >
            View
          </Link>
        </div>
      ))}
    </div>
  );
};
