import { AppointmentId } from "./AppointmentId";

export default async function AppointmentPage({ params }) {
  const { appointmentId } = await params;

  return (
    <div>
      <p>Appointment id : {appointmentId}</p>
      <AppointmentId id={appointmentId} />
    </div>
  );
}
