import { AppointmentId } from "./AppointmentId";

export default async function AppointmentPage({ params }) {
  const { appointmentId } = await params;

  return (
    <div>
      <AppointmentId id={appointmentId} />
    </div>
  );
}
