'use client'

import { usePatientAppointment } from '@/hooks/patient/usePatient'

export const Appointment = ({ id }) => {
  const { data, isLoading, isError, error } = usePatientAppointment(id)

  if (isLoading)
    return (
      <p className='text-center py-4 text-gray-500'>
        Loading appointment details...
      </p>
    )

  if (isError)
    return (
      <p className='text-center py-4 text-red-500'>
        Error loading appointment details: {error.message}
      </p>
    )

  const { doctorId, reason, notes, createdAt, status, timeSlot, date } = data
  const { name, email, specialization, department } = doctorId

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow space-y-6'>
      <h2 className='text-2xl font-semibold text-gray-800'>
        Appointment ID: <span className='text-blue-600'>{id}</span>
      </h2>

      <div className='border rounded-md p-4 bg-gray-50'>
        <h3 className='text-xl font-semibold text-gray-700 mb-2'>
          Doctor Information
        </h3>
        <p>
          <span className='font-medium'>Name:</span> {name}
        </p>
        <p>
          <span className='font-medium'>Email:</span> {email}
        </p>
        <div className='mt-2'>
          <p>
            <span className='font-medium'>Specialty:</span> {specialization}
          </p>
          <p>
            <span className='font-medium'>Department:</span> {department}
          </p>
        </div>
      </div>

      <div className='border rounded-md p-4 bg-gray-50'>
        <h3 className='text-xl font-semibold text-gray-700 mb-2'>
          Appointment Details
        </h3>
        <p>
          <span className='font-medium'>Reason:</span> {reason}
        </p>
        <p>
          <span className='font-medium'>Note:</span> {notes}
        </p>
        <p>
          <span className='font-medium'>Status:</span> {status}
        </p>
        <div className='mt-2'>
          <p>
            <span className='font-medium'>Date:</span> {date}
          </p>
          <p>
            <span className='font-medium'>Time:</span> {timeSlot}
          </p>
        </div>
        <p className='mt-2 text-sm text-gray-600'>
          Created on: {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
