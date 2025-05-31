'use client'

// import { getDoctors } from "@/admin/service";
import useProtectedRoute from '@/app/useProtectedRoute'
import { UserCard } from '@/components/UserCard'
import { AppState } from '@/store/context'
import { AdminMainMenu } from '@/utils/adminNav'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { CategoryScale } from 'chart.js'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import Chart from 'chart.js/auto'
import PieChart from '@/components/Chart'

import Dropdown from '@/components/Dropdown'
import {
  useArchiveDoctor,
  useArchivePatient,
  useDoctorsData,
  usePatientsData,
  useUnarchiveDoctor,
  useUnarchivePatient
} from '@/hooks/admin/useAdmin'
import Table from '@/components/Table'

Chart.register(CategoryScale)

const dropdownActions = patient => {
  const id = patient._id
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
      label: patient.isActive ? 'Archive' : 'Unarchive'
    }
  ]
}

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

export default function AdminDashboard () {
  useProtectedRoute()
  const { user } = AppState()
  console.log('authenticated user data: ', user)

  const [chartData, setChartData] = useState(null)
  const [doctorChart, setDoctorChart] = useState(null)

  const [doctorsPage, setDoctorsPage] = useState(1)
  const doctorsLimit = 10

  const [patientsPage, setPatientsPage] = useState(1)
  const patientsLimit = 10

  const {
    data: patientsData,
    isLoading: loadingPatients,
    error,
    isError,
    refetch,
    isFetching: fetchingPatients,
    isLoadingError,
    loadingError
  } = usePatientsData(patientsPage, patientsLimit)
  const patientsCount = patientsData?.count
  const patientsFirstPage = patientsPage === 1
  const patientsCurrentPage = patientsData?.currentPage
  const patientsTotalPages = patientsData?.totalPages
  const patientsLastPage = patientsPage === patientsTotalPages

  const {
    data: doctorsData,
    isLoading: loadingDoctors,
    error: doctorsError,
    refetch: refetchDoctor,
    isFetching: fetchingDoctors
  } = useDoctorsData(doctorsPage, doctorsLimit)
  const doctorsCount = doctorsData?.count
  const doctorsTotalPages = doctorsData?.totalPages
  const doctorsFirstPage = doctorsPage === 1
  const doctorsLastPage = doctorsPage === doctorsTotalPages
  const doctorsCurrentPage = doctorsData?.currentPage

  const { mutateAsync: archivePatient } = useArchivePatient()
  const { mutateAsync: archiveDoctor } = useArchiveDoctor()
  const { mutateAsync: unarchiveDoctor } = useUnarchiveDoctor()
  const { mutateAsync: unarchivePatient } = useUnarchivePatient()

  useEffect(() => {
    if (patientsData) {
      const { patients } = patientsData

      const patientsPerMonth = patients.reduce((acc, patient) => {
        const month = dayjs(patient.createdAt).format('MM YYYY')
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {})

      const labels = Object.keys(patientsPerMonth)
      const counts = Object.values(patientsPerMonth)

      setChartData({
        labels,
        datasets: [
          {
            label: 'Patients',
            data: counts,
            backgroundColor: [
              'rgba(75,192,192,1)',
              '#ecf0f1',
              '#50AF95',
              '#f3ba2f',
              '#2a71d0'
            ],
            borderColor: 'black',
            borderWidth: 1
          }
        ]
      })
    }
  }, [patientsData])

  useEffect(() => {
    if (doctorsData) {
      const doctorsPerMonth = doctorsData?.doctors?.reduce((acc, doctor) => {
        const month = dayjs(doctor.createdAt).format('MM YYYY')
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {})

      const labels = Object.keys(doctorsPerMonth)
      const counts = Object.values(doctorsPerMonth)

      setDoctorChart({
        labels,
        datasets: [
          {
            label: 'Doctors',
            data: counts,
            backgroundColor: [
              'rgba(75,192,192,1)',
              '#ecf0f1',
              '#50AF95',
              '#f3ba2f',
              '#2a71d0'
            ],
            borderColor: 'black',
            borderWidth: 1
          }
        ]
      })
    }
  }, [doctorsData])

  if (loadingPatients && loadingDoctors) return <p>Loading...</p>

  const archivePatientHandler = async id => {
    try {
      await archivePatient({
        id,
        isActive: false
      })
      console.log('success archiving patient')
      await refetch()
    } catch (error) {
      console.error('error archiving patient: ', error.message)
      throw error
    }
  }
  const archiveDoctorHandler = async id => {
    try {
      await archiveDoctor({
        id,
        isActive: false
      })

      await refetchDoctor()
    } catch (error) {
      console.error('Error archiving doctor profile: ', error)
      throw error
    }
  }

  const unarchiveDoctorHandler = async id => {
    try {
      await unarchiveDoctor({
        id,
        isActive: true
      })

      await refetchDoctor()
    } catch (error) {
      console.error('error unarchiving doctor: ', error)
      throw error
    }
  }
  const unarchivePatientHandler = async id => {
    try {
      await unarchivePatient({
        id,
        isActive: true
      })

      await refetch()
    } catch (error) {
      console.error('error unarchiving patient: ', error)
      throw error
    }
  }

  const patientTableHeaders = (
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
      <th className='px-4 py-3 border-b text-left text-sm font-medium text-gray-700'></th>
    </>
  )

  const patientTableData =
    patientsCount === 0 ? (
      <tr>
        <td
          colSpan={6}
          className='px-4 py-6 text-center text-gray-500 italic border-b'
        >
          No patients in the system.
        </td>
      </tr>
    ) : (
      patientsData?.patients?.map((patient, index) => (
        <tr key={patient._id} className='hover:bg-gray-50'>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {index + 1}
          </td>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {patient.name}
          </td>
          <td className='px-4 py-3 border-b text-sm text-gray-700'>
            {patient.email}
          </td>
          <td className='px-4 py-3 border-b'>
            <Dropdown
              actions={dropdownActions(patient)}
              actionHandler={actionLabel =>
                actionLabel === 'Archive'
                  ? archivePatientHandler(patient._id)
                  : unarchivePatientHandler(patient._id)
              }
            />
          </td>
        </tr>
      ))
    )

  const doctorTableHeaders = (
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
    doctorsCount === 0 ? (
      <tr>
        <td
          colSpan={6}
          className='px-4 py-6 text-center text-gray-500 italic border-b'
        >
          No doctors in the system.
        </td>
      </tr>
    ) : (
      doctorsData?.doctors?.map((doctor, index) => (
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
    <div className='px-10 py-10'>
      {/* Header */}
      <div className='flex justify-between items-center mb-10'>
        <div>
          <h1 className='text-2xl font-semibold'>Welcome to CareConnect</h1>
          <p className='text-gray-600'>CareConnect {user?.role} dashboard</p>
        </div>
        <UserCard name={user?.name} role={user?.role} />
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
        {/* Patients Chart */}
        <div className='p-4 rounded shadow bg-white h-96 flex flex-col justify-center'>
          {loadingPatients ? (
            <p>Loading patients chart...</p>
          ) : patientsCount === 0 ? (
            <>
              <p className='text-center text-gray-500 mb-2'>
                No chart data to display
              </p>
              <PieChart
                text='Patients data'
                chartData={{
                  labels: ['No Data'],
                  datasets: [
                    {
                      label: 'No Data',
                      data: [1],
                      backgroundColor: ['#547792'],
                      borderWidth: 0
                    }
                  ]
                }}
              />
            </>
          ) : (
            <PieChart text='Patients data' chartData={chartData} />
          )}
        </div>

        {/* Doctors Chart */}
        <div className='p-4 rounded shadow bg-white h-96 flex flex-col justify-center'>
          {loadingDoctors ? (
            <p>Loading doctors chart...</p>
          ) : doctorsCount === 0 ? (
            <>
              <p className='text-center text-gray-500 mb-2'>
                No chart data to display
              </p>
              <PieChart
                text='Doctors data'
                chartData={{
                  labels: ['No Data'],
                  datasets: [
                    {
                      label: 'No Data',
                      data: [1],
                      backgroundColor: ['#213448'],
                      borderWidth: 0
                    }
                  ]
                }}
              />
            </>
          ) : (
            <PieChart text='Doctors data' chartData={doctorChart} />
          )}
        </div>
      </div>

      {/* Tables Section */}
      <div className='space-y-12'>
        {/* Patients Table */}
        <div className='p-4 rounded shadow bg-white'>
          <Table
            tableHeaders={patientTableHeaders}
            tableData={patientTableData}
            isFirstPage={patientsFirstPage}
            isLastPage={patientsLastPage}
            currentPage={patientsCurrentPage}
            totalPages={patientsTotalPages}
            isFetching={fetchingPatients}
            nextPageHandler={p => (p < patientsTotalPages ? p + 1 : p)}
            prevPageHandler={() => setPatientsPage(p => Math.max(p - 1, 1))}
          />
        </div>

        {/* Doctors Table */}
        <div className='p-4 rounded shadow bg-white'>
          <Table
            tableHeaders={doctorTableHeaders}
            tableData={doctorsTableData}
            isFirstPage={doctorsFirstPage}
            isLastPage={doctorsLastPage}
            currentPage={doctorsCurrentPage}
            totalPages={doctorsTotalPages}
            isFetching={fetchingDoctors}
            nextPageHandler={p => (p < doctorsTotalPages ? p + 1 : p)}
            prevPageHandler={() => setDoctorsPage(p => Math.max(p - 1, 1))}
          />
        </div>
      </div>
    </div>
  )
}
