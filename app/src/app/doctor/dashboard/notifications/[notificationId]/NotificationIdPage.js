'use client'
import Link from 'next/link'
import { useDoctorNotification } from '../../../../../hooks/doctor/useDoctorNotification'

const notificationDate = createdAt => {
  if (!createdAt) {
    return 'No date'
  }

  const now = new Date()
  const created = new Date(createdAt)
  const diffInSeconds = Math.floor((now - created) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
}

const notificationType = type => {
  const types = {
    appointment_request: 'Appointment Request',
    appointment_request_update: 'Appointment Requested Update',
    appointment_status_update: 'Appointment Status Update.',
    general: 'General'
  }

  return types[type] || ''
}

export default function NotificationIdPage ({ id }) {
  const { data, isLoading, isError, error } = useDoctorNotification(id)

  if (isLoading) return <p>Loading notification</p>
  if (isError) return <p>{error}</p>

  console.log('notification: ', data)

  const { _id, receiver, type, message, appointment, createdAt } = data

  const receiverEmail = receiver?.email
  const receiverName = receiver?.name

  const appointmentId = appointment?._id
  const appointmentDate = appointment?.date
  const appointmentTimeSlot = appointment?.timeSlot
  const doctorEmail = appointment?.doctorId?.email
  const doctorName = appointment?.doctorId?.name

  console.log('doctor-name: ' + doctorName + 'doctor-email: ' + doctorEmail)

  return (
    <div id={_id}>
      <div>
        <div>
          <div>
            <p>{notificationType(type)}</p>
            <p>{notificationDate(createdAt)}</p>
          </div>
          <p>{message}</p>
          <div>
            <h3>To:</h3>
            <p>{receiverName}</p>
            <p>{receiverEmail}</p>
          </div>
        </div>
        <div>
          <div>
            <h3>Doctor Information</h3>
            <p> {doctorName} </p>
            <p>{doctorEmail}</p>
          </div>
          <p>
            Appointment date / time:{' '}
            {`${appointmentDate} / ${appointmentTimeSlot}`}{' '}
          </p>
          <Link href={`/doctor/dashboard/appointments/${appointmentId}`}>
            View Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
