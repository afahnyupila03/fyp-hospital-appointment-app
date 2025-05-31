'use client'

import { usePatientAppointments } from '@/hooks/patient/usePatient'
import { useState } from 'react'
import Table from '@/components/Table'
import Dropdown from '@/components/Dropdown'

export default function PatientAppointments () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, error, isFetching } =
    usePatientAppointments(page, limit)

  const firstPage = data?.currentPage === 1
  const totalPages = data?.totalPages
  const lastPage = page === totalPages
  const currentPage = data?.currentPage

  const tableHeaders = (
    <>
      <th className='px-4 py-2 text-left'>S/N</th>
      <th className='px-4 py-2 text-left'>Doctor</th>
      <th className='px-4 py-2 text-left'>Date</th>
      <th className='px-4 py-2 text-left'>Time</th>
      <th className='px-4 py-2 text-left'>Status</th>
      <th className='px-4 py-2 text-left'></th>
    </>
  )

  let tableData

  const actions = appointment => {
    const id = appointment._id
    const status = appointment.status

    const routes = {
      pending: [
        {
          id,
          type: 'link',
          link: `appointments/${id}`,
          label: 'View'
        },
        {
          id,
          type: 'link',
          link: `/patient/dashboard/book-appointment/${id}`,
          label: 'Update',
          query: { editing: true }
        }
      ]
    }

    return (
      routes[status] || [
        {
          id,
          type: 'link',
          link: `${id}`,
          label: 'View'
        }
      ]
    )
  }

 const statusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'confirmed': return 'bg-green-100 text-green-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}


  if (isLoading) {
    tableData = (
      <tr>
        <td colSpan={6} className='text-center py-4 text-gray-500'>
          Loading...
        </td>
      </tr>
    )
  } else if (isError) {
    tableData = (
      <tr>
        <td colSpan={6} className='text-center py-4 text-red-500'>
          {error || 'Error loading data'}
        </td>
      </tr>
    )
  } else if (data?.count === 0) {
    tableData = (
      <tr>
        <td colSpan={6} className='text-center py-4 text-gray-400'>
          No appointments
        </td>
      </tr>
    )
  } else {
    tableData = data.appointments.map((app, i) => (
      <tr key={app._id} className='border-t'>
        <td className='px-4 py-2'>{i + 1}</td>
        <td className='px-4 py-2'>{app.doctorId?.name}</td>
        <td className='px-4 py-2'>{new Date(app.date).toLocaleDateString()}</td>
        <td className='px-4 py-2'>{app.timeSlot}</td>
        <td className='px-4 py-2'>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${statusColor(
              app.status
            )}`}
          >
            {app.status}
          </span>
        </td>

        <td className='px-4 py-2'>
          <Dropdown actions={actions(app)} />
        </td>
      </tr>
    ))
  }

  return (
    <div className='p-6 bg-white shadow rounded-md'>
      <h2 className='text-2xl font-semibold mb-4 text-gray-800'>
        Patient Appointments
      </h2>

      <Table
        tableHeaders={tableHeaders}
        tableData={tableData}
        isFetching={isFetching}
        isFirstPage={firstPage}
        isLastPage={lastPage}
        currentPage={currentPage}
        totalPages={totalPages}
        nextPageHandler={() => setPage(p => (p < totalPages ? p + 1 : p))}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
