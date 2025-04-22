// import { useQuery } from "@tanstack/react-query";

export default async function AppointmentPage({ params }) {
  const { appointmentId } = await params;

  return <p>Appointment page {appointmentId}</p>;
}
