export default async function PatientAppointmentPage ({ params }) {
  const { appointmentId } = await params
  return <div>Patient appointment page: {appointmentId}.</div>
}
