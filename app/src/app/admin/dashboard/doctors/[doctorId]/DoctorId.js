"use client";

import { getDoctorService } from "@/api/admin/doctorManagementService";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export const DoctorId = ({ id }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctorService(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <p>Loading doctor profile</p>;
  if (isError) return <p>Error loading doctor profile: {error.message}</p>;

  const { name, email, specialization, department, isActive, appointments } =
    data;

  const appointmentCounter = appointments.length;
  if (appointmentCounter === 0) return <p>No booked appointments.</p>;

  return (
    <div>
      <h3>Doctor Information</h3>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <div>
        <p>Specialty: {specialization}</p>
        <p>Department: {department}</p>
      </div>
      <div>
        <p>Schedules: remember to include doctor schedule(s)</p>
      </div>
      <p>Account status: {isActive}</p>

      <div>
        <h3>Appointments</h3>
        <p>Total booked appointments: {appointmentCounter}</p>

        {appointments.map((appointment) => (
          <div key={appointment._id}>
            <p>Patient name: {appointment?.patientId?.name}</p>
            <p>Patient email: {appointment?.patientId?.email}</p>
            <p>Appointment reason: {appointment.reason}</p>
            <p>Appointment note: {appointment.notes}</p>
            <p>
              Appointment day and time:
              {`${appointment.date} - ${appointment.timeSlot}`}
            </p>
            <p>Appointment status: {appointment.status}</p>
            <Link
              href={`/admin/dashboard/doctors/${id}/appointments/${appointment._id}`}
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
