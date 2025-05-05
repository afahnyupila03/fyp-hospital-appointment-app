"use client";

import { useDoctorAppointment } from "@/hooks/useDoctor";

export const AppointmentId = ({ id }) => {
  const { data, isLoading, isError, error } = useDoctorAppointment(id);

  if (isLoading) return <p>Loading appointment details</p>;
  if (isError) return <p>{`${error.message} - ${error.name}`}</p>;

  console.log("appointment: ", data);

  const {
    date,
    timeSlot,
    notes,
    reason,
    status,
    patientId: { _id, email, name },
  } = data;

  return (
    <div>
      <p>p-name: {name}</p>
      <p>p-email: {email}</p>
      <div>
        <h3>Appointment details</h3>
        <p>Day - Time: {`${date} - ${timeSlot}`}</p>
        <p>Reason: {reason}</p>
        <p>Note: {notes}</p>
        <div>
          <p>Status: {status}</p>
          <button type="button">Update appointment status</button>
        </div>
      </div>
    </div>
  );
};
