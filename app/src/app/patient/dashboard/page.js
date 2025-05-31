'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppState } from '@/store/context'
import { usePatientNotificationPermission } from '@/hooks/patient/usePatientNotification'
import {
  usePatientAppointments,
  usePatientDoctors
} from '@/hooks/patient/usePatient'
import PieChart, { DoughnutChart } from '@/components/Chart'
import Table from '@/components/Table'
import Dropdown from '@/components/Dropdown'

import { CategoryScale } from 'chart.js'
import Chart from 'chart.js/auto'
Chart.register(CategoryScale)

const appointmentActions = appointment => {
  const id = appointment._id
  const status = appointment.status

  const actions = {
    pending: [
      {
        id,
        type: 'link',
        label: 'Update',
        link: `/patient/dashboard/book-appointment/${id}`,
        query: {
          editing: true
        }
      },
      {
        id,
        type: 'link',
        label: 'View',
        link: `/patient/dashboard/appointments/${id}`
      }
    ]
  }

  return (
    actions[status] || [
      {
        id,
        type: 'link',
        label: 'View',
        link: `/patient/dashboard/appointments/${id}`
      }
    ]
  )
}

const doctorsActions = doctors => {
  const id = doctors._id
  const name = doctors.name

  return [
    {
      id,
      type: 'link',
      label: 'Book',
      link: '/patient/dashboard/book-appointment',
      query: {
        id,
        name
      }
    },
    {
      id,
      type: 'link',
      label: 'View',
      link: `/patient/dashboard/doctors/${id}`
    }
  ]
}

const getStatusCounts = appointments => {
  const counts = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0
  }

  appointments?.appointments.forEach(appt => {
    const status = appt.status?.toLowerCase()
    if (counts[status] !== undefined) {
      counts[status]++
    }
  })

  return counts
}

const statusColors = {
  pending: '#facc15',
  confirmed: '#22c55e',
  completed: '#3b82f6',
  canceled: '#ef4444'
}

export default function PatientDashboardPage () {
  const { user, loading } = AppState()
  const router = useRouter()

  const [patientAppointments, setPatientAppointments] = useState(null)
  const [appointmentMonthlyData, setAppointmentMonthlyData] = useState(null)

  const [appointmentPage, setAppointmentPage] = useState(1)
  const appointmentLimit = 10

  const [doctorsPage, setDoctorsPage] = useState(1)
  const doctorsLimit = 10

  const { mutateAsync: notificationRequest } =
    usePatientNotificationPermission()

  useEffect(() => {
    if (loading || !user) return

    if (user.notificationPermission) return

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(async result => {
        const granted = result === 'granted'
        try {
          await notificationRequest({ granted })
          user.notificationPermission = granted
        } catch (error) {
          console.error('Failed to save notification permission: ', error)
        }
      })
    } else {
      const granted = Notification.permission === 'granted'
      notificationRequest({ granted }).catch(err =>
        console.error('Failed to sync permission:', err)
      )
    }
  }, [user, notificationRequest])

  const {
    data: appointments,
    isLoading: loadingAppointments,
    isError: isAppointmentError,
    error: appointmentError,
    isFetching: fetchingAppointments
  } = usePatientAppointments(appointmentPage, appointmentLimit)

  const {
    data: doctors,
    isLoading: loadingDoctors,
    isError: isDoctorsError,
    error: doctorsError,
    isFetching: fetchingDoctors
  } = usePatientDoctors(doctorsPage, doctorsLimit)

  useEffect(() => {
    if (appointments?.appointments) {
      const statusCounts = getStatusCounts(appointments)

      const doughnutData = {
        labels: ['Pending', 'Confirmed', 'Completed', 'Canceled'],
        datasets: [
          {
            label: 'Appointments',
            data: [
              statusCounts.pending,
              statusCounts.confirmed,
              statusCounts.completed,
              statusCounts.canceled
            ],
            backgroundColor: Object.values(statusColors),
            borderRadius: 4
          }
        ]
      }
      setPatientAppointments(doughnutData)

      const monthlyCounts = {}

      appointments.appointments.forEach(appt => {
        const date = new Date(appt.createdAt)
        const monthLabel = date.toLocaleString('default', { month: 'long' })
        monthlyCounts[monthLabel] = (monthlyCounts[monthLabel] || 0) + 1
      })

      const pieData = {
        labels: Object.keys(monthlyCounts),
        datasets: [
          {
            label: 'Appointments per Month',
            data: Object.values(monthlyCounts),
            backgroundColor: [
              '#f87171',
              '#fb923c',
              '#facc15',
              '#4ade80',
              '#60a5fa',
              '#a78bfa',
              '#f472b6',
              '#34d399',
              '#fbbf24',
              '#818cf8',
              '#ec4899',
              '#22d3ee'
            ],
            borderRadius: 4
          }
        ]
      }

      setAppointmentMonthlyData(pieData)
    }
  }, [appointments])

  if (loading || loadingAppointments || loadingDoctors || !user) {
    return <p className='text-center mt-10 text-lg text-gray-600'>Loading...</p>
  }

  if (isDoctorsError) return <p>{doctorsError?.message}</p>
  if (isAppointmentError) return <p>{appointmentError?.message}</p>

  const appointmentTableHeaders = (
    <>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        S/N
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Doctor
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Day
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Time
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Status
      </th>
      <th className='px-4 py-3'></th>
    </>
  )

  const appointmentTableData =
    appointments?.count === 0 ? (
      <tr>
        <td colSpan={6} className='text-center text-gray-500 py-4'>
          No Booked appointments
        </td>
      </tr>
    ) : (
      appointments?.appointments.map((appointment, index) => (
        <tr
          key={appointment._id}
          className='bg-white hover:bg-gray-50 transition rounded-lg shadow-sm'
          style={{
            backgroundColor: statusColors[appointment.status?.toLowerCase()]
          }}
        >
          <td className='px-4 py-3'>{index + 1}</td>
          <td className='px-4 py-3'>{appointment.doctorId.name}</td>
          <td className='px-4 py-3'>{appointment.date}</td>
          <td className='px-4 py-3'>{appointment.timeSlot}</td>
          <td className='px-4 py-3 capitalize'>{appointment.status}</td>
          <td className='px-4 py-3'>
            <Dropdown actions={appointmentActions(appointment)} />
          </td>
        </tr>
      ))
    )

  const doctorsTableHeaders = (
    <>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        S/N
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Name
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Specialty
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Availability
      </th>
      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
        Department
      </th>
      <th className='px-4 py-3'></th>
    </>
  )

  const doctorsTableData =
    doctors?.count === 0 ? (
      <tr>
        <td colSpan={6} className='text-center text-gray-500 py-4'>
          No registered doctors
        </td>
      </tr>
    ) : (
      doctors?.doctors.map((doctor, index) => (
        <tr
          key={doctor._id}
          className='hover:bg-gray-50 transition rounded-lg shadow-sm'
          style={{
            backgroundColor: index % 2 === 0 ? '#f5f5ff' : '#e9e9ff'
          }}
        >
          <td className='px-4 py-3'>{index + 1}</td>
          <td className='px-4 py-3'>{doctor.name}</td>
          <td className='px-4 py-3'>{doctor.specialization}</td>
          <td
            className='px-4 py-3 text-blue-600 cursor-pointer hover:underline'
            title='Click to view schedule'
            onClick={() =>
              router.push(`/patient/dashboard/doctors/${doctor._id}`)
            }
          >
            {doctor.schedules.slice(0, 1).map(schedule => (
              <span key={schedule._id}>
                {schedule.day} at {schedule.time}...
              </span>
            ))}
          </td>
          <td className='px-4 py-3'>{doctor.department}</td>
          <td className='px-4 py-3'>
            <Dropdown actions={doctorsActions(doctor)} />
          </td>
        </tr>
      ))
    )

  return (
    <div className='px-4 py-8 space-y-8'>
      {/* Chart Section */}
      <div className='flex flex-col md:flex-row gap-8 justify-center px-4'>
        {appointments?.count === 0 ? (
          <p className='text-center text-gray-500 w-full'>
            No appointment data for charts.
          </p>
        ) : (
          <>
            <div className='bg-white shadow-lg p-6 rounded-2xl w-full md:w-1/2'>
              <h3 className='text-lg font-semibold mb-4 text-center'>
                Appointment Status Breakdown
              </h3>
              <DoughnutChart chartData={patientAppointments} />
            </div>
            <div className='bg-white shadow-lg p-6 rounded-2xl w-full md:w-1/2'>
              <h3 className='text-lg font-semibold mb-4 text-center'>
                Appointments by Month
              </h3>
              <PieChart chartData={appointmentMonthlyData} />
            </div>
          </>
        )}
      </div>

      {/* Appointments Table */}
      <div className='bg-white shadow-md p-4 rounded-xl'>
        <h2 className='text-lg font-semibold mb-2'>Appointments</h2>
        <Table
          tableHeaders={appointmentTableHeaders}
          tableData={appointmentTableData}
          currentPage={appointments?.currentPage}
          totalPages={appointments?.totalPages}
          isFetching={fetchingAppointments}
          isFirstPage={appointmentPage === 1}
          isLastPage={appointmentPage === appointments?.totalPages}
          nextPageHandler={() =>
            setAppointmentPage(p => (p < appointments.totalPages ? p + 1 : p))
          }
          prevPageHandler={() => setAppointmentPage(p => Math.max(p - 1, 1))}
        />
      </div>

      <div className='bg-white shadow-md p-6 rounded-2xl space-y-4'>
        <h2 className='text-xl font-semibold'>Doctors</h2>
        <Table
          tableHeaders={doctorsTableHeaders}
          tableData={doctorsTableData}
          currentPage={doctors?.currentPage}
          totalPages={doctors?.totalPages}
          isFetching={fetchingDoctors}
          isFirstPage={doctorsPage === 1}
          isLastPage={doctorsPage === doctors?.totalPages}
          nextPageHandler={() =>
            setDoctorsPage(p => (p < doctors.totalPages ? p + 1 : p))
          }
          prevPageHandler={() => setDoctorsPage(p => Math.max(p - 1, 1))}
        />
      </div>
    </div>
  )
}
