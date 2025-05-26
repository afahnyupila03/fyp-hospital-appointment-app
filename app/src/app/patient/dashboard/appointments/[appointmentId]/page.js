import AppointmentId from './AppointmentId'

export default async function PatientAppointmentPage ({ params }) {
  const { appointmentId } = await params

  return (
    <div>
      <div>Patient appointment page: {appointmentId}.</div>
      <AppointmentId id={appointmentId} />
    </div>
  )
}
