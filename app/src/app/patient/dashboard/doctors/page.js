'use client'

import Dropdown from '@/components/Dropdown'
import Table from '@/components/Table'
import { usePatientDoctors } from '@/hooks/patient/usePatient'
import { useState } from 'react'

const actions = doctors => {
  const id = doctors._id
  return [
    {
      id,
      type: 'link',
      label: 'Book',
      link: `${id}/book-appointment`
    },
    {
      id,
      type: 'link',
      label: 'View',
      link: `${id}`
    }
  ]
}

export default function DoctorsPage () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, error, refetch, isFetching } =
    usePatientDoctors(page, limit)

  if (isLoading) return <p>Loading doctors...</p>
  if (isError) return <p>{error}</p>

  const doctors = data?.doctors || []
  const totalPages = data?.totalPages
  const currentPage = data?.currentPage
  const isFirstPage = page === 1
  const isLastPage = page === data?.totalPages

  const tableHeaders = (
    <>
      <th>S/N</th>
      <th>Name</th>
      <th>Specialty</th>
      <th>Department</th>
      <th></th>
    </>
  )

  const tableData = doctors.map((doctor, index) => (
    <tr>
      <td>{index + 1}</td>
      <td>{doctor.name}</td>
      <td>{doctor.specialization}</td>
      <td>{doctor.department}</td>
      <td>
        <Dropdown actions={actions(doctor)} />
      </td>
    </tr>
  ))

  return (
    <div>
      <Table
        tableHeaders={tableHeaders}
        tableData={tableData}
        totalPages={totalPages}
        currentPage={currentPage}
        isFetching={isFetching}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        nextPageHandler={() => setPage(p => (p < page ? p + 1 : p))}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
