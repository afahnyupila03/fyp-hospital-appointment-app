'use client'

import Dropdown from '@/components/Dropdown'
import Table from '@/components/Table'
import { usePatientDoctors } from '@/hooks/patient/usePatient'
import { useState } from 'react'

const actions = doctor => {
  const id = doctor._id
  const name = doctor.name
  return [
    {
      id,
      type: 'link',
      label: 'View',
      link: `doctors/${id}`
    },
    {
      id,
      type: 'link',
      label: 'Book',
      link: `book-appointment`,
      query: {
        id,
        name
      }
    }
  ]
}

export default function DoctorsPage () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, error, refetch, isFetching } =
    usePatientDoctors(page, limit)

  if (isLoading)
    return <p className='text-center text-gray-600 mt-6'>Loading doctors...</p>
  if (isError) return <p className='text-center text-red-500 mt-6'>{error}</p>

  const doctors = data?.doctors || []
  const totalPages = data?.totalPages
  const currentPage = data?.currentPage
  const isFirstPage = page === 1
  const isLastPage = page === data?.totalPages

  const tableHeaders = (
    <>
      <th className='px-4 py-2 text-left text-sm font-medium text-gray-700'>
        S/N
      </th>
      <th className='px-4 py-2 text-left text-sm font-medium text-gray-700'>
        Name
      </th>
      <th className='px-4 py-2 text-left text-sm font-medium text-gray-700'>
        Specialty
      </th>
      <th className='px-4 py-2 text-left text-sm font-medium text-gray-700'>
        Department
      </th>
      <th className='px-4 py-2'></th>
    </>
  )

  const tableData = doctors.map((doctor, index) => (
    <tr key={doctor._id} className='border-b hover:bg-gray-50'>
      <td className='px-4 py-2'>{index + 1}</td>
      <td className='px-4 py-2'>{doctor.name}</td>
      <td className='px-4 py-2'>{doctor.specialization}</td>
      <td className='px-4 py-2'>{doctor.department}</td>
      <td className='px-4 py-2'>
        <Dropdown actions={actions(doctor)} />
      </td>
    </tr>
  ))

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-semibold mb-4 text-gray-800'>
        Available Doctors
      </h2>
      <Table
        tableHeaders={tableHeaders}
        tableData={tableData}
        totalPages={totalPages}
        currentPage={currentPage}
        isFetching={isFetching}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        nextPageHandler={() => setPage(p => (p < totalPages ? p + 1 : p))}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
