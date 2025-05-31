'use client'

import {
  useArchivePatient,
  usePatientsData,
  useUnarchivePatient
} from '@/hooks/admin/useAdmin'
import Table from '@/components/Table'
import Link from 'next/link'
import { useState } from 'react'
import Dropdown from '@/components/Dropdown'

export default function PatientsHomePage () {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, error, refetch, isFetching } =
    usePatientsData(page, limit)

  const count = data?.count
  const totalPages = data?.totalPages
  const currentPage = data?.currentPage
  const firstPage = page === 1
  const lastPage = page === totalPages

  const { mutateAsync: archivePatient } = useArchivePatient()
  const { mutateAsync: unarchivePatient } = useUnarchivePatient()

  const archivePatientHandler = async id => {
    try {
      await archivePatient({ id, isActive: false })
      refetch()
    } catch (error) {
      console.error('Error archiving patient:', error)
    }
  }

  const unarchivePatientHandler = async id => {
    try {
      await unarchivePatient({ id, isActive: true })
      refetch()
    } catch (error) {
      console.error('Error un-archiving patient:', error)
    }
  }

  const actions = patient => {
    const id = patient._id
    const isActive = patient.isActive
    return [
      {
        id,
        type: 'link',
        label: 'View',
        link: `/admin/dashboard/patients/${id}`
      },
      {
        id,
        type: 'button',
        label: isActive ? 'Archive' : 'Unarchive',
        actionKey: isActive ? 'archive' : 'unarchive'
      }
    ]
  }

  const tableHeaders = (
    <>
      <th className='text-left px-4 py-2 w-[5%]'>S/N</th>
      <th className='text-left px-4 py-2 w-[35%]'>Name</th>
      <th className='text-left px-4 py-2 w-[40%]'>Email</th>
      <th className='text-left px-4 py-2 w-[20%]'>Actions</th>
    </>
  )

  const tableData =
    count === 0 ? (
      <tr>
        <td
          colSpan={4}
          className='px-4 py-6 text-center text-gray-500 italic border-b'
        >
          No patients found.
        </td>
      </tr>
    ) : (
      data?.patients?.map((pat, index) => (
        <tr
          key={pat._id}
          className='hover:bg-gray-50 border-b transition duration-150 ease-in-out'
        >
          <td className='px-4 py-2'>{(currentPage - 1) * limit + index + 1}</td>
          <td className='px-4 py-2'>{pat.name}</td>
          <td className='px-4 py-2'>{pat.email}</td>
          <td className='px-4 py-2'>
            <Dropdown
              actions={actions(pat)}
              actionHandler={actionKey =>
                actionKey === 'archive'
                  ? archivePatientHandler(pat._id)
                  : unarchivePatientHandler(pat._id)
              }
            />
          </td>
        </tr>
      ))
    )

  if (isLoading)
    return <p className='text-center py-6'>Loading patients data...</p>
  if (isError)
    return (
      <p className='text-center py-6 text-red-500'>Error: {error.message}</p>
    )

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-semibold text-gray-800'>Patients List</h2>
      </div>

      <Table
        isFetching={isFetching}
        isFirstPage={firstPage}
        isLastPage={lastPage}
        currentPage={currentPage}
        totalPages={totalPages}
        tableHeaders={tableHeaders}
        tableData={tableData}
        nextPageHandler={() => setPage(p => Math.min(p + 1, totalPages))}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
