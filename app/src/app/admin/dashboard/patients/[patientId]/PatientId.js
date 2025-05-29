'use client'

import {
  useArchivePatient,
  usePatientData,
  useUnarchivePatient
} from '@/hooks/admin/useAdmin'
import Link from 'next/link'

export const PatientId = ({ id }) => {
  const { data, isLoading, error, isError } = usePatientData(id)

  const { mutateAsync: archivePatient } = useArchivePatient()
  const { mutateAsync: unArchivePatient } = useUnarchivePatient()

  if (isLoading)
    return (
      <p className='text-center py-4 text-gray-500'>Loading patient data...</p>
    )

  if (isError)
    return (
      <p className='text-center py-4 text-red-500'>
        Error loading patient data: {error.message}
      </p>
    )

  const { name, email, appointments, isActive, _id } = data
  const appointmentCounter = appointments.length

  const archivePatientHandler = async id => {
    try {
      await archivePatient({ id, isActive: false })
      window.location.reload()
    } catch (error) {
      console.error('Error archiving patient:', error)
    }
  }

  const unarchivePatientHandler = async id => {
    try {
      await unArchivePatient({ id, isActive: true })
      window.location.reload()
    } catch (error) {
      console.error('Error un-archiving patient:', error)
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow'>
      <h2 className='text-2xl font-semibold mb-4 text-gray-800'>
        Patient Information
      </h2>
      <div className='mb-6 space-y-2'>
        <p>
          <span className='font-medium'>Name:</span> {name}
        </p>
        <p>
          <span className='font-medium'>Email:</span> {email}
        </p>
      </div>

      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-700 mb-2'>
          Appointments
        </h3>
        <p className='mb-4 text-sm text-gray-600'>
          Total appointments: {appointmentCounter}
        </p>

        <button
          onClick={
            isActive
              ? () => archivePatientHandler(_id)
              : () => unarchivePatientHandler(_id)
          }
          className={`px-4 py-2 rounded text-white ${
            isActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } transition duration-200 mb-4`}
        >
          {isActive ? 'Archive' : 'Unarchive'}
        </button>

        {appointmentCounter === 0 ? (
          <p className='italic text-gray-500'>No appointments yet.</p>
        ) : (
          <div className='space-y-4'>
            {appointments.map(appointment => (
              <div
                key={appointment._id}
                className='border rounded-md p-4 bg-gray-50'
              >
                <p>
                  <span className='font-medium'>Reason:</span>{' '}
                  {appointment.reason}
                </p>
                <p>
                  <span className='font-medium'>Notes:</span>{' '}
                  {appointment.notes}
                </p>
                <Link
                  href={`/admin/dashboard/patients/${id}/appointments/${appointment._id}`}
                  className='text-blue-600 hover:underline mt-2 inline-block'
                >
                  View Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
