import { Appointment } from "./Appointment";

export default async function AppointmentIdPage({ params }) {
  const { appointmentId } = await params;

  return <Appointment id={appointmentId} />;
}
