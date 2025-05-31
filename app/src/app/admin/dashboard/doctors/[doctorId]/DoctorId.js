'use client'

import {
  useArchiveDoctor,
  useDoctorData,
  useUnarchiveDoctor
} from '@/hooks/admin/useAdmin'
import Link from 'next/link'

export const DoctorId = ({ id }) => {
  const { data, isLoading, isError, error, refetch } = useDoctorData(id)
  const { mutateAsync: archiveDoctor } = useArchiveDoctor()
  const { mutateAsync: unarchiveDoctor } = useUnarchiveDoctor()

  if (isLoading) return <p className="text-center">Loading doctor profile...</p>
  if (isError) return <p className="text-red-500">{error}</p>

  const {
    _id,
    name,
    email,
    specialization,
    department,
    isActive,
    appointments,
    createdBy,
    createdAt,
    schedules,
    terminatedAt
  } = data
  console.log('doctors data: ', data)

  const archiveDoctorHandler = async id => {
    try {
      await archiveDoctor({ id, isActive: false })
      refetch()
    } catch (error) {
      console.error('archive handler error', error)
    }
  }

  const unarchiveDoctorHandler = async id => {
    try {
      await unarchiveDoctor({ id, isActive: true })
      refetch()
    } catch (error) {
      console.error('unarchive handler error', error)
    }
  }

  const appointmentCounter = appointments.length

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Doctor Profile</h2>
        <div className="space-y-1 text-gray-700">
          <p><span className="font-semibold">Name:</span> {name}</p>
          <p><span className="font-semibold">Email:</span> {email}</p>
          <p><span className="font-semibold">Specialization:</span> {specialization}</p>
          <p><span className="font-semibold">Department:</span> {department}</p>
          <p><span className="font-semibold">Account Status:</span> 
            <span className={`ml-1 font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
          <p>
            <span className="font-semibold">Created By:</span> {createdBy.name}
            <span className="ml-2 text-sm text-gray-500">({new Date(createdAt).toLocaleDateString()})</span>
          </p>
          {terminatedAt && (
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Terminated On:</span> {new Date(terminatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-4 space-x-3">
          <button
            onClick={isActive ? () => archiveDoctorHandler(_id) : () => unarchiveDoctorHandler(_id)}
            className={`px-4 py-2 rounded-md text-white ${
              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isActive ? 'Archive' : 'Unarchive'}
          </button>

          <Link
            href={{
              pathname: `/admin/dashboard/doctors/create-doctor/${_id}`,
              query: { editing: true }
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Update Profile
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Schedules</h3>
        {schedules?.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {schedules.map((schedule, index) => (
              <li key={schedule._id}>{schedule.day} — {schedule.time}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No schedules available</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Appointments</h3>
        <p className="text-gray-600 mb-3">Total: {appointmentCounter}</p>

        {appointmentCounter === 0 ? (
          <p className="text-gray-500 italic">No appointments booked.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const {
                _id,
                patientId: { name: patientName, email: patientEmail },
                status,
                timeSlot,
                date,
                reason,
                notes
              } = appointment

              return (
                <div key={_id} className="border p-4 rounded-md shadow-sm bg-gray-50">
                  <p><span className="font-medium">Patient:</span> {patientName} ({patientEmail})</p>
                  <p><span className="font-medium">Date & Time:</span> {date} - {timeSlot}</p>
                  <p><span className="font-medium">Status:</span> {status}</p>
                  {reason && <p><span className="font-medium">Reason:</span> {reason}</p>}
                  {notes && <p><span className="font-medium">Notes:</span> {notes}</p>}

                  <Link
                    href={`/admin/dashboard/doctors/${id}/appointments/${_id}`}
                    className="inline-block mt-2 text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
