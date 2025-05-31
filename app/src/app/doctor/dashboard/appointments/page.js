'use client'

import Dropdown from '@/components/Dropdown'
import Table from '@/components/Table'
import {
  useDoctorAppointments,
  useUpdateDoctorAppointment
} from '@/hooks/doctor/useDoctor'
import React, { useState } from 'react'

const appointmentActions = appointment => {
  const id = appointment._id
  const status = appointment.status
  const viewAction = {
    id,
    type: 'link',
    label: 'View',
    link: `appointments/${id}`
  }

  const actions = {
    pending: [
      { id, type: 'button', label: 'Confirm', actionKey: 'confirm' },
      { id, type: 'button', label: 'Cancel', actionKey: 'cancel' },
      viewAction
    ],
    confirmed: [
      { id, type: 'button', label: 'Complete', actionKey: 'complete' },
      { id, type: 'button', label: 'Cancel', actionKey: 'cancel' },
      viewAction
    ]
  }

  return actions[status] || [viewAction]
}

const statusColors = {
  pending: '#facc15', // yellow
  confirmed: '#22c55e', // green
  completed: '#3b82f6', // blue
  canceled: '#ef4444' // red
}

function AppointmentsPage () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isFetching, isError, error } = useDoctorAppointments(
    page,
    limit
  )

  const { mutateAsync: updateAppointment } = useUpdateDoctorAppointment()

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40 text-gray-500'>
        Loading appointments...
      </div>
    )
  }

  if (isError) {
    return (
      <div className='text-red-500 text-center py-10'>
        {error?.message || 'An error occurred while fetching appointments.'}
      </div>
    )
  }

  const isFirstPage = page === 1
  const isLastPage = page === data.totalPages
  const currentPage = data.currentPage
  const totalPages = data.totalPages
  const count = data.count

  const updateStatus = async (id, status) => {
    try {
      await updateAppointment({ id, status })
      console.log(`Appointment status updated... [${status}]`)
    } catch (error) {
      console.error(`Error updating appointment to ${status}: `, error)
    }
  }

  const tableHeaders = (
    <>
      <th className='py-3 px-4 text-left bg-gray-200'>S/N</th>
      <th className='py-3 px-4 text-left bg-gray-200'>Name</th>
      <th className='py-3 px-4 text-left bg-gray-200'>Email</th>
      <th className='py-3 px-4 text-left bg-gray-200'>Reason</th>
      <th className='py-3 px-4 text-left bg-gray-200'>Note</th>
      <th className='py-3 px-4 text-left bg-gray-200'>Status</th>
      <th className='py-3 px-4 text-left bg-gray-200'>Actions</th>
    </>
  )

  const tableData =
    count === 0 ? (
      <tr>
        <td colSpan={7} className='text-center py-10 text-gray-500'>
          No appointments found at the moment.
        </td>
      </tr>
    ) : (
      data.appointments?.map((appointment, index) => (
        <tr
          key={appointment._id}
          className='text-sm'
          style={{
            backgroundColor:
              statusColors[appointment.status?.toLowerCase()] || '#f1f5f9'
          }}
        >
          <td className='py-3 px-4'>{index + 1}</td>
          <td
            className='py-3 px-4 truncate max-w-[150px]'
            title={appointment.patientId?.name}
          >
            {appointment.patientId?.name || 'N/A'}
          </td>
          <td className='py-3 px-4'>{appointment.patientId?.email || 'N/A'}</td>
          <td className='py-3 px-4'>{appointment.reason || 'N/A'}</td>
          <td
            className='py-3 px-4 truncate max-w-[150px]'
            title={appointment.notes}
          >
            {appointment.notes || 'N/A'}
          </td>
          <td className='py-3 px-4 capitalize'>{appointment.status}</td>
          <td className='py-3 px-4'>
            <Dropdown
              actions={appointmentActions(appointment)}
              actionHandler={actionKey => {
                actionKey === 'confirm'
                  ? updateStatus(appointment._id, 'confirmed')
                  : actionKey === 'complete'
                  ? updateStatus(appointment._id, 'completed')
                  : actionKey === 'cancel' &&
                    updateStatus(appointment._id, 'canceled')
              }}
            />
          </td>
        </tr>
      ))
    )

  return (
    <div className='p-4 bg-white rounded shadow'>
      <h2 className='text-2xl font-semibold mb-4'>Appointments</h2>
      <Table
        isFetching={isFetching}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        currentPage={currentPage}
        totalPages={totalPages}
        tableHeaders={tableHeaders}
        tableData={tableData}
        nextPageHandler={() => setPage(p => (p < totalPages ? p + 1 : p))}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}

export default AppointmentsPage
