'use client'

import { usePatientAppointment } from '@/hooks/patient/usePatient'

export default function AppointmentId ({ id }) {
  const { isLoading, isError, error, data } = usePatientAppointment(id)

  if (isLoading)
    return <p className='text-gray-600'>Loading appointment details...</p>
  if (isError)
    return (
      <p className='text-red-500'>
        Error: {error?.message || 'Failed to load appointment.'}
      </p>
    )

  const { _id, doctorId, status, date, timeSlot, notes, reason } = data
  const { name, email } = doctorId || {}

  const statusColors = {
    pending: '#facc15',
    confirmed: '#22c55e',
    completed: '#3b82f6',
    canceled: '#ef4444'
  }

  return (
    <div className='space-y-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>
          Appointment Information
        </h2>
        <ul className='space-y-3 text-gray-700'>
          <li>
            <span className='font-medium'>Status: </span>
            <span
              className='px-2 py-1 rounded text-white text-sm'
              style={{ backgroundColor: statusColors[status] || '#6b7280' }}
            >
              {status}
            </span>
          </li>
          <li>
            <span className='font-medium'>Doctor: </span>
            {name} ({email})
          </li>
          <li>
            <span className='font-medium'>Date: </span>
            {new Date(date).toLocaleDateString()}
          </li>
          <li>
            <span className='font-medium'>Time: </span>
            {timeSlot}
          </li>
          {reason && (
            <li>
              <span className='font-medium'>Reason: </span>
              {reason}
            </li>
          )}
          {notes && (
            <li>
              <span className='font-medium'>Notes: </span>
              {notes}
            </li>
          )}
        </ul>
    </div>
  )
}
