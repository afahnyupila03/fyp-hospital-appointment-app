'use client'

import { usePatientAppointment } from '@/hooks/patient/usePatient'

export default function AppointmentId ({ id }) {
  const { isLoading, isError, error, data } = usePatientAppointment(id)

  if (isLoading) return <p>Loading appointment details</p>
  if (isError) return <p>{error}</p>

  console.log('patient appointment: ', data)

  const { _id, doctorId, status, date, timeSlot, notes, reason } = data
  const { _id: docId, name, email } = doctorId

  return (
    <div>
      <div>Appointment id page</div>

      <div id={_id}>
        <ol>
          <li>{status}</li>
          <li>{notes}</li>
          <li>{reason}</li>
        </ol>
      </div>
    </div>
  )
}
