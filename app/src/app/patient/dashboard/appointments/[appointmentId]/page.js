import AppointmentId from './AppointmentId'

export default async function PatientAppointmentPage ({ params }) {
  const { appointmentId } = await params

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-semibold text-gray-800'>
        Appointment Details
      </h1>
      <div className='text-gray-600'>
        Appointment ID: <span className='font-medium'>{appointmentId}</span>
      </div>
      <div className='bg-white p-4 rounded-xl shadow-sm border'>
        <AppointmentId id={appointmentId} />
      </div>
    </div>
  )
}
