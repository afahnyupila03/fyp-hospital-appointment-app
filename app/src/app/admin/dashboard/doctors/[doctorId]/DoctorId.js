"use client";

import {
  useArchiveDoctor,
  useDoctorData,
  useUnarchiveDoctor,
} from "@/hooks/admin/useAdmin";

import Link from "next/link";

export const DoctorId = ({ id }) => {
  const { data, isLoading, isError, error } = useDoctorData(id);

  const { mutateAsync: archiveDoctor } = useArchiveDoctor();
  const { mutateAsync: unarchiveDoctor } = useUnarchiveDoctor();

  if (isLoading) return <p>Loading doctor profile</p>;
  if (isError) return <p>Error loading doctor profile: {error.message}</p>;

  const {
    _id,
    name,
    email,
    specialization,
    department,
    isActive,
    appointments,
  } = data;

  const appointmentCounter = appointments.length;
  if (appointmentCounter === 0) return <p>No booked appointments.</p>;

  const archiveDoctorHandler = async (id) => {
    try {
      await archiveDoctor({ id, isActive: false });
      window.location.reload();
    } catch (error) {
      console.error("archive handler error", error);
      throw error;
    }
  };

  const unarchiveDoctorHandler = async (id) => {
    try {
      await unarchiveDoctor({ id, isActive: true });
      window.location.reload();
    } catch (error) {
      console.error("error un-archiving doctor: ", error);
      throw error;
    }
  };

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

      <button
        type="button"
        onClick={
          isActive === true
            ? () => archiveDoctorHandler(_id)
            : () => unarchiveDoctorHandler(_id)
        }
      >
        {isActive === true ? "Archive" : "Unarchive"}
      </button>
      <Link href={`/admin/dashboard/doctors/create-doctor/${_id}`}>
        Update profile
      </Link>

      <div>
        <h3>Appointments</h3>
        <p>Total booked appointments: {appointmentCounter}</p>

        {appointments.map((appointment) => {
          const {
            _id,
            patientId: { name, email, reason, notes },
            status,
            timeSlot,
            date,
          } = appointment;

          console.log("patientId appointment: ", appointment);

          return (
            <div key={_id}>
              <p>Patient name: {name}</p>
              <p>Patient email: {email}</p>
              <p>Appointment reason: {reason}</p>
              <p>Appointment note: {notes}</p>
              <p>
                Appointment day and time:
                {`${date} - ${timeSlot}`}
              </p>
              <p>Appointment status: {status}</p>
              <Link href={`/admin/dashboard/doctors/${id}/appointments/${_id}`}>
                View
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
