"use client";

import {
  useArchivePatient,
  usePatientData,
  useUnarchivePatient,
} from "@/hooks/admin/useAdmin";
import Link from "next/link";

export const PatientId = ({ id }) => {
  const { data, isLoading, error, isError } = usePatientData(id);

  const { mutateAsync: archivePatient } = useArchivePatient();
  const { mutateAsync: unArchivePatient } = useUnarchivePatient();

  if (isLoading) return <p>Loading patient data</p>;
  if (isError) return <p>Error loading patient data, {error.message}</p>;

  const { name, email, appointments, isActive, _id } = data;

  const appointmentCounter = appointments.length;
  if (appointmentCounter === 0) return <p>No appointments yet.</p>;
  console.log("appointments: ", appointments);

  const archivePatientHandler = async (id) => {
    try {
      await archivePatient({
        id,
        isActive: false,
      });
      window.location.reload();
    } catch (error) {
      console.error("error archiving patient: ", error);
      throw error;
    }
  };

  const unarchivePatientHandler = async (id) => {
    try {
      await unArchivePatient({
        id,
        isActive: true,
      });
      window.location.reload();
    } catch (error) {
      console.error("error un-archiving patient: ", error);
      throw error;
    }
  };

  return (
    <div>
      <h3>Patient Information</h3>
      <p>Name: {name}</p>
      <p>Email: {email}</p>

      <h3>Patient Appointments</h3>
      <p>Total appointments: {appointmentCounter}</p>

      <button
        type="button"
        onClick={
          isActive === true
            ? () => archivePatientHandler(_id)
            : () => unarchivePatientHandler(_id)
        }
      >
        {isActive === true ? "Archive" : "Unarchive"}
      </button>

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
