'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppState } from '@/store/context'
import { usePatientNotificationPermission } from '@/hooks/patient/usePatientNotification'
import {
  usePatientAppointments,
  usePatientDoctors
} from '@/hooks/patient/usePatient'
import PieChart, { DoughnutChart, BarChart } from '@/components/Chart'

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
        link: `/patient/dashboard/book-appointment/${id}?editing=true`
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

  return [
    {
      id,
      type: 'link',
      label: 'View',
      link: `/patient/dashboard/doctors/${id}`
    },
    {
      id,
      type: 'link',
      label: 'Book',
      link: `/patient/dashboard/doctors/${id}/book-appointment`
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
  pending: '#facc15', // yellow
  confirmed: '#22c55e', // green
  completed: '#3b82f6', // blue
  canceled: '#ef4444' // red
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
    if (loading) return
    if (!user) return

    // If permission exist in backend, do nothing.
    if (user.notificationPermission) return

    // Only prompt the browser if permission has not been granted/denied yet.
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(async result => {
        const granted = result === 'granted'
        try {
          // persist granted result.
          await notificationRequest({ granted })
          user.notificationPermission = granted
        } catch (error) {
          console.error(
            'Failed to save patient notification permission: ',
            error
          )
        }
      })
    } else {
      // Browser already has a verdict (granted/denied) but backend hasn't recorded it.
      const granted = Notification.permission === 'granted'
      notificationRequest({ granted }).catch(err =>
        console.error('Failed to sync patient existing permission:', err)
      )
    }
  }, [user, notificationRequest])

  const {
    data: appointments,
    isLoading: loadingAppointments,
    isError: isAppointmentError,
    error: appointmentError,
    isFetching: fetchingAppointments,
    refetch: refetchAppointments
  } = usePatientAppointments(appointmentPage, appointmentLimit)
  const appointmentFirstPage = appointmentPage === 1
  const appointmentTotalPages = appointments?.totalPages
  const appointmentLastPage = appointmentPage === appointmentTotalPages
  const appointmentCurrentPage = appointments?.currentPage

  const {
    data: doctors,
    isLoading: loadingDoctors,
    refetch: refetchDoctors,
    isError: isDoctorsError,
    error: doctorsError,
    isFetching: fetchingDoctors
  } = usePatientDoctors(doctorsPage, doctorsLimit)
  const doctorsFirstPage = doctorsPage === 1
  const doctorsLastPage = doctorsPage === doctors?.totalPages
  const doctorsTotalPages = doctors?.totalPages
  const doctorsCurrentPage = doctors?.currentPage

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
            backgroundColor: ['#facc15', '#22c55e', '#3b82f6', '#ef4444'],
            borderRadius: 4
          }
        ]
      }
      setPatientAppointments(doughnutData)

      // Monthly chart appointment representation.
      const monthlyCounts = {}

      appointments?.appointments.forEach(appt => {
        const date = new Date(appt.createdAt) // or appt.updatedAt
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

  if (loadingDoctors || loadingAppointments || !user || loading)
    return <p>Loading...</p>
  if (isDoctorsError) {
    return <p>{doctorsError}</p>
  }
  if (isAppointmentError) {
    return <p>{appointmentError}</p>
  }

  console.log('patients doctors: ', doctors)

  const appointmentTableHeaders = (
    <>
      <th>S/N</th>
      <th>Doctor</th>
      <th>Day </th>
      <th>Time</th>
      <th>Status</th>
      <th></th>
    </>
  )
  const appointmentTableData =
    appointments?.count === 0 ? (
      <tr>No Booked appointments</tr>
    ) : (
      appointments?.appointments?.map((appointment, index) => (
        <tr
          style={{
            backgroundColor: statusColors[appointment.status?.toLowerCase()]
          }}
          key={appointment._id}
        >
          <td>{index + 1}</td>
          <td>{appointment.doctorId.name}</td>
          <td>{appointment.date}</td>
          <td>{appointment.timeSlot}</td>
          <td>{appointment.status}</td>
          <td>
            <Dropdown actions={appointmentActions(appointment)} />
          </td>
        </tr>
      ))
    )

  const doctorsTableHeaders = (
    <>
      <th>S/N</th>
      <th>Name</th>
      <th>Specialty</th>
      <th>Availability</th>
      <th>Department</th>
      <th></th>
    </>
  )
  const doctorsTableData =
    doctors?.count === 0 ? (
      <tr>No registered doctors in system</tr>
    ) : (
      doctors?.doctors?.map((doctor, index) => (
        <tr
          style={{
            backgroundColor: index % 2 === 0 ? '#ceceff' : '#e6e6ff'
          }}
          key={doctor._id}
          className='cursor-pointer'
          onClick={() =>
            router.push(`/patient/dashboard/doctors/${doctor._id}`)
          }
        >
          <td>{index + 1}</td>
          <td>{doctor.name}</td>
          <td>{doctor.specialization}</td>
          <td
            className='cursor-pointer'
            title="Click to view the doctor's profile and hospital schedule"
          >
            {doctor.schedules.slice(0, 1)?.map(schedule => (
              <span key={schedule._id}>
                {schedule.day} at {schedule.time}...
              </span>
            ))}
          </td>

          <td>{doctor.department}</td>
          <td>
            <Dropdown actions={doctorsActions(doctor)} />
          </td>
        </tr>
      ))
    )

  return (
    <div>
      {/* Charts section. */}
      {/* Appointment breakdown by status */}
      {appointments?.count === 0 ? (
        <p className='mt-10 text-center text-gray-500'>
          No appointment data to display in charts.
        </p>
      ) : (
        <DoughnutChart
          chartData={patientAppointments}
          text='Appointment Status Breakdown'
        />
      )}

      {/* Appointment breakdown by booked periods (month). */}
      {appointments?.count === 0 ? (
        <p className='mt-10 text-center text-gray-500'>
          No appointment data to display in charts.
        </p>
      ) : (
        <PieChart
          chartData={appointmentMonthlyData}
          text='Appointments by Month'
        />
      )}

      {/* Appointment Table */}
      <Table
        tableHeaders={appointmentTableHeaders}
        tableData={appointmentTableData}
        currentPage={appointmentCurrentPage}
        totalPages={appointmentTotalPages}
        isFetching={fetchingAppointments}
        isFirstPage={appointmentFirstPage}
        isLastPage={appointmentLastPage}
        nextPageHandler={() =>
          setAppointmentPage(p => (p < appointmentTotalPages ? p + 1 : p))
        }
        prevPageHandler={() => setDoctorsPage(p => Math.max(p - 1, 1))}
      />

      {/* Doctor Table */}
      <Table
        tableHeaders={doctorsTableHeaders}
        tableData={doctorsTableData}
        currentPage={doctorsCurrentPage}
        totalPages={doctorsTotalPages}
        isFetching={fetchingDoctors}
        isFirstPage={doctorsFirstPage}
        isLastPage={doctorsLastPage}
        nextPageHandler={() =>
          setDoctorsPage(p => (p < doctorsTotalPages ? p + 1 : p))
        }
        prevPageHandler={() => setDoctorsPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
