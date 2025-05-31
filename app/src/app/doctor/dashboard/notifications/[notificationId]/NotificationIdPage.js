'use client'
import Link from 'next/link'
import { useDoctorNotification } from '../../../../../hooks/doctor/useDoctorNotification'

const notificationDate = createdAt => {
  if (!createdAt) return 'No date'
  const now = new Date()
  const created = new Date(createdAt)
  const diffInSeconds = Math.floor((now - created) / 1000)

  if (diffInSeconds < 60)
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
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

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-lg text-blue-600 font-medium'>
          Loading notification...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-lg text-red-600 font-medium'>
          Error: {error?.message || 'Something went wrong'}
        </p>
      </div>
    )
  }

  const { receiver, type, message, appointment, createdAt } = data
  const receiverEmail = receiver?.email
  const receiverName = receiver?.name
  const appointmentId = appointment?._id
  const appointmentDate = appointment?.date
  const appointmentTimeSlot = appointment?.timeSlot
  const doctorEmail = appointment?.doctorId?.email
  const doctorName = appointment?.doctorId?.name

  return (
    <div id={id} className='max-w-4xl mx-auto p-6'>
      <div className='bg-white shadow rounded-xl p-6 space-y-6'>
        <div className='flex justify-between items-start border-b pb-4'>
          <div>
            <h2 className='text-xl font-semibold text-gray-800'>
              {notificationType(type)}
            </h2>
            <p className='text-sm text-gray-500'>
              {notificationDate(createdAt)}
            </p>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-1'>Message</h3>
          <p className='text-gray-700'>{message}</p>
        </div>
      </div>

      <div className='mt-4 border-t pt-4'>
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>
          Appointment Details
        </h3>
        <p className='text-gray-600 mb-2'>
          {appointmentDate} / {appointmentTimeSlot}
        </p>
        <Link
          href={`/doctor/dashboard/appointments/${appointmentId}`}
          className='inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition'
        >
          View Appointment
        </Link>
      </div>
    </div>
  )
}
