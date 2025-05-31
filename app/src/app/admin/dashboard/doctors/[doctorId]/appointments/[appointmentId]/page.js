import { AppointmentId } from "./AppointmentId";

export default async function AppointmentIdPage({ params }) {
  const { appointmentId } = await params;

  return <AppointmentId id={appointmentId} />
}
