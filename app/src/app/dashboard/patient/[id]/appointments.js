"use client";

import { getDoctorService } from "@/api/admin/doctorManagementService";
import { viewAppointmentService } from "@/api/appointment/patient/service";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export const Appointment = ({ appointments, id }) => {
  const appointmentCounter = appointments.length;

  if (appointmentCounter === 0) return <p>No appointments</p>;

  return (
    <div>
      <p>Total Appointments: {appointmentCounter}</p>

      {appointments.map((appointment) => (
        <AppointmentItem
          id={id}
          key={appointment._id}
          appointment={appointment}
        />
      ))}
    </div>
  );
};

export const AppointmentItem = ({ appointment, id }) => {
  const { doctorId, date, notes, reason, status, timeSlot, createdAt, _id } =
    appointment;

  const {
    data: appointmentData,
    isLoading: appointmentLoading,
    error: appointmentError,
    isError: appointmentIsError,
  } = useQuery({
    queryKey: ["appointment", _id],
    queryFn: () => viewAppointmentService(_id),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorService(doctorId),
  });

  if (isLoading) return <p>Loading doctor data...</p>;
  if (isError) return <p>Error loading doctor data: {error.message}</p>;

  const { name, email, specialization, department, isActive } = data;
  console.log("doctor data: ", data);

  return (
    <div>
      <p>Doctor Information</p>
      <p>Doctor name: {name}</p>
      <p>Doctor email: {email}</p>
      <p>Specialty: {specialization}</p>
      <p>Department: {department}</p>
      <p>Status: {isActive}</p>

      <p>Appointment Information</p>
      <div className="flex justify-around">
        <p>Day: {date}</p>
        <p>Time: {timeSlot}</p>
      </div>
      <p>Notes: {notes}</p>
      <p>Reason: {reason}</p>
      <p>Appointment Status: {status}</p>
      <p>Appointment created at: {new Date(createdAt).toDateString()}</p>
      <Link href={`/dashboard/patient/${id}/appointment/${_id}`}>View</Link>
    </div>
  );
};
