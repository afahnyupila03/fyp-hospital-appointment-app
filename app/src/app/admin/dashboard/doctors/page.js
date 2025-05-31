'use client'

import { useDoctorsData } from '@/hooks/admin/useAdmin'
import Link from 'next/link'
import Dropdown from '@/components/Dropdown'
import Table from '@/components/Table'

import { useState } from 'react'

const doctorDropdownActions = doctor => {
  const id = doctor._id
  const isActive = doctor.isActive
  return [
    {
      id,
      type: 'link',
      label: 'View',
      link: `/admin/dashboard/doctors/${id}`
    },
    {
      id,
      type: 'link',
      label: 'Update',
      link: `/admin/dashboard/doctors/create-doctor/${id}`,
      query: {
        editing: true
      }
    },
    {
      id,
      type: 'button',
      label: isActive ? 'Archive' : 'Unarchive',
      actionKey: isActive ? 'archive' : 'unarchive'
    }
  ]
}

export default function DoctorsHomePage () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isError, error, isFetching } = useDoctorsData(
    page,
    limit
  )
  const firstPage = page === 1
  const totalPages = data?.totalPages
  const lastPage = page === totalPages
  const count = data?.count
  const currentPage = data?.currentPage

  if (isLoading) return <p>Loading doctor profiles</p>
  if (isError) return <p> {error}</p>

  const doctorsTableHeaders = (
    <>
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'>
        S/N
      </th>
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'>
        Name
      </th>
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'>
        Email
      </th>
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'>
        Specialty
      </th>
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'>
        Department
      </th>
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'></th>
    </>
  )

  const doctorsTableData =
    count === 0 ? (
      <tr>
        <td
          colSpan={6}
          className='px-4 py-6 text-center text-gray-500 italic border-b'
        >
          No doctors in the system.
        </td>
      </tr>
    ) : (
      data?.doctors?.map((doctor, index) => (
        <tr key={doctor._id} className='hover:bg-gray-50'>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {index + 1}
          </td>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {doctor.name}
          </td>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {doctor.email}
          </td>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {doctor.specialization}
          </td>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {doctor.department}
          </td>
          <td className='px-4 py-3 border-b'>
            <Dropdown
              actions={doctorDropdownActions(doctor)}
              actionHandler={actionKey =>
                actionKey === 'archive'
                  ? archiveDoctorHandler(doctor._id)
                  : unarchiveDoctorHandler(doctor._id)
              }
            />
          </td>
        </tr>
      ))
    )

  return (
    <div>
      <Table
        isFetching={isFetching}
        isFirstPage={firstPage}
        isLastPage={lastPage}
        currentPage={currentPage}
        totalPages={totalPages}
        tableHeaders={doctorsTableHeaders}
        tableData={doctorsTableData}
        nextPageHandler={p => (p < totalPages ? P + 1 : p)}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
