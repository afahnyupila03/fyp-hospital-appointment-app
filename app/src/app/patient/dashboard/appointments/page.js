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
      <th>S/N</th>
      <th>Doctor</th>
      <th>Date</th>
      <th>Time</th>
      <th>Status</th>
      <th></th>
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

  if (isLoading) {
    tableData = (
      <tr>
        <td colSpan={4}>Loading...</td>
      </tr>
    )
  } else if (isError) {
    tableData = (
      <tr>
        <td colSpan={4}>{error || 'Error loading data'}</td>
      </tr>
    )
  } else if (data?.count === 0) {
    tableData = (
      <tr>
        <td colSpan={4}>No appointments</td>
      </tr>
    )
  } else {
    tableData = data.appointments.map((app, i) => (
      <tr key={app._id}>
        <td>{i + 1}</td>
        <td>{app.doctorId?.name}</td>
        <td>{new Date(app.date).toLocaleDateString()}</td>
        <td>{app.timeSlot}</td>
        <td>{app.status}</td>
        <td>
          <Dropdown actions={actions(app)} />
        </td>
      </tr>
    ))
  }

  return (
    <div>
      <p>Patient appointments</p>
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
