"use client";

import { viewAppointmentService } from "@/api/appointment/doctor/service";
import { useQuery } from "@tanstack/react-query";

export const AppointmentId = ({ id }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => viewAppointmentService(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <p>Loading appointment details</p>;
  if (isError) return <p>Error loading appointment: {error.message}</p>;

  const {
    patientId,
    doctorId,
    status,
    notes,
    reason,
    date,
    timeSlot,
    createdAt,
    updatedAt,
  } = data;
  const { name: patientName, email: patientEmail } = patientId;
  const {
    name: doctorName,
    email: doctorEmail,
    specialization,
    department,
  } = doctorId;

  const create = new Date(createdAt).toISOString();
  let update;

  //   Check if day appointment was created and updated are the same.
  // If the same, don't display updated at for appointment.

  if (create === new Date(updatedAt).toISOString()) {
    update = "Appointment not updated.";
  } else {
    update = new Date(updatedAt).toISOString();
  }

  return (
    <div>
      <div>
        <h3>Doctor details</h3>
        <p>name: {doctorName}</p>
        <p>email: {doctorEmail}</p>
        <p>specialty: {specialization}</p>
        <p>department: {department}</p>
      </div>

      <div>
        <h3>Patient details</h3>
        <p>name: {patientName}</p>
        <p>email: {patientEmail}</p>
      </div>

      <div>
        <h3>Appointment details</h3>
        <p>Reason: {reason}</p>
        <p>Note: {notes}</p>
        <p>Date - Time : {`${date} - ${timeSlot}`}</p>
        <p>Status: {status}</p>
      </div>

      <div>
        <p>Date of appointment created: {create}</p>
        <p>Appointment updated at : {update}</p>
      </div>
    </div>
  );
};
