"use client";

import { usePatientAppointment } from "@/hooks/usePatient";

export const Appointment = ({ id }) => {
  const { data, isLoading, isError, error, refetch, isRefetchError } =
    usePatientAppointment(id);

  if (isLoading) return <p>Loading appointment details</p>;

  if (isError) return <p>Error loading appointment details, {error.message}</p>;

  console.log("appointment data: ", data);
  const { doctorId, reason, notes, createdAt, status, timeSlot, date, _id } =
    data;

  const { name, email, specialization, department } = doctorId;

  return (
    <div>
      <p>Appointment id(6806c3f778083fbbcb13ad1d): {id}</p>
      <div>
        <p>Doctor Information</p>

        <div>
          <p>Doctor name: {name}</p>
          <p>Doctor email: {email}</p>
          <div>
            <p>Specialty: {specialization}</p>
            <p>Department: {department}</p>
          </div>
        </div>
      </div>
      <div>
        <p>Appointment details</p>
        <p>Reason: {reason}</p>
        <p>Note: {notes}</p>
        <p>Status: {status}</p>
        <div>
          <p>Day: {date}</p>
          <p>Time: {timeSlot}</p>
        </div>
        <p>
          Appointment created on : {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
