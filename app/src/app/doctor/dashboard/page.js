'use client'

import {
  useDoctorAppointments,
  useUpdateDoctorAppointment
} from '@/hooks/doctor/useDoctor'
import { AppState } from '@/store/context'

import { UserCard } from '@/components/UserCard'
import { DoughnutChart, BarChart } from '@/components/Chart'
import { useEffect, useState } from 'react'
import { CategoryScale } from 'chart.js'
import Chart from 'chart.js/auto'
import Dropdown from '@/components/Dropdown'
import Table from '@/components/Table'
import { useDoctorNotificationPermission } from '@/hooks/doctor/useDoctorNotification'

Chart.register(CategoryScale)

const getStatusCounts = appointments => {
  const counts = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    canceled: 0
  }

  appointments.forEach(appt => {
    const status = appt.status?.toLowerCase()
    if (counts[status] !== undefined) {
      counts[status]++
    }
  })

  return counts
}

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

export default function DoctorDashboardPage () {
  const { user } = AppState()
  const [docAppointments, setDocAppointments] = useState(null)
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error, isError, isFetching } = useDoctorAppointments(
    page,
    limit
  )

  const { mutateAsync: updateAppointment } = useUpdateDoctorAppointment()
  const { mutateAsync: notificationRequest } = useDoctorNotificationPermission()

  useEffect(() => {
    if (!user) return
    if (user.notificationPermission) return

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(async result => {
        const granted = result === 'granted'
        try {
          await notificationRequest({ granted })
          user.notificationPermission = granted
        } catch (err) {
          console.error('Failed to save notification permission:', err)
        }
      })
    } else {
      const granted = Notification.permission === 'granted'
      notificationRequest({ granted }).catch(err =>
        console.error('Failed to sync existing permission:', err)
      )
    }
  }, [user, notificationRequest])

  useEffect(() => {
    if (data?.appointments) {
      const statusCounts = getStatusCounts(data.appointments)
      setDocAppointments({
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
      })
    }
  }, [data])

  if (isLoading || !user) {
    return (
      <div className='flex justify-center items-center min-h-screen text-gray-600 text-lg'>
        Loading appointments...
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center min-h-screen text-red-500 text-lg'>
        Error:
        {error?.message || 'Something went wrong while fetching appointments.'}
      </div>
    )
  }

  const confirmHandler = async id => {
    try {
      await updateAppointment({ id, status: 'confirmed' })
    } catch (error) {
      console.error('Error confirming appointment:', error)
    }
  }

  const completedHandler = async id => {
    try {
      await updateAppointment({ id, status: 'completed' })
    } catch (error) {
      console.error('Error completing appointment:', error)
    }
  }

  const cancelHandler = async id => {
    try {
      await updateAppointment({ id, status: 'canceled' })
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const tableHeaders = (
    <>
      <th className='py-4 px-6 text-left'>S/N</th>
      <th className='py-4 px-6 text-left'>Name</th>
      <th className='py-4 px-6 text-left'>Email</th>
      <th className='py-4 px-6 text-left'>Reason</th>
      <th className='py-4 px-6 text-left'>Note</th>
      <th className='py-4 px-6 text-left'>Status</th>
      <th className='py-4 px-6 text-left'></th>
    </>
  )

  const tableData =
    data?.count === 0 ? (
      <tr>
        <td colSpan={7} className='text-center py-10 text-gray-500'>
          No appointments found at the moment.
        </td>
      </tr>
    ) : (
      data?.appointments?.map((appointment, index) => (
        <tr
          key={appointment._id}
          className='text-sm'
          style={{
            backgroundColor:
              statusColors[appointment.status?.toLowerCase()] || '#f1f5f9'
          }}
        >
          <td className='py-4 px-6'>{(page - 1) * limit + index + 1}</td>
          <td
            className='py-4 px-6 truncate max-w-[150px]'
            title={appointment.patientId.name}
          >
            {appointment.patientId.name}
          </td>
          <td className='py-4 px-6'>{appointment.patientId.email}</td>
          <td className='py-4 px-6'>{appointment.reason}</td>
          <td
            className='py-4 px-6 truncate max-w-[150px]'
            title={appointment.notes}
          >
            {appointment.notes}
          </td>
          <td className='py-4 px-6 capitalize'>{appointment.status}</td>
          <td className='py-4 px-6'>
            <Dropdown
              actions={appointmentActions(appointment)}
              actionHandler={action => {
                if (action.actionKey === 'confirm') {
                  confirmHandler(appointment._id)
                } else if (action.actionKey === 'complete') {
                  completedHandler(appointment._id)
                } else if (action.actionKey === 'cancel') {
                  cancelHandler(appointment._id)
                }
              }}
            />
          </td>
        </tr>
      ))
    )

  return (
    <div className='px-4 md:px-12 py-8 space-y-12'>
      <div className='flex justify-between items-center border-b pb-4 w-full'>
        <div className='flex-1'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Welcome to CareConnect
          </h1>
          <p className='text-sm text-gray-500 mt-1 capitalize'>
            {user?.role} dashboard
          </p>
        </div>
        <div className='shrink-0'>
          <UserCard name={user?.name} role={user?.role} />
        </div>
      </div>

      {docAppointments?.datasets?.[0]?.data?.every(count => count === 0) ? (
        <p className='text-center text-gray-400 text-md mt-10'>
          No appointment data to display in charts.
        </p>
      ) : (
        <div className='flex flex-col md:flex-row gap-6'>
          <div className='w-full md:w-1/2'>
            <DoughnutChart
              chartData={docAppointments}
              text='Appointment Status Breakdown'
            />
          </div>
          <div className='w-full md:w-1/2'>
            <BarChart
              chartData={docAppointments}
              text='Appointment Status Breakdown'
            />
          </div>
        </div>
      )}

      <div className='mt-16'>
        {data?.count === 0 ? (
          <div className='text-center py-10 text-gray-400 text-md'>
            No appointments found at the moment.
          </div>
        ) : (
          <Table
            tableHeaders={tableHeaders}
            tableData={tableData}
            currentPage={data?.currentPage}
            totalPages={data?.totalPages}
            isFetching={isFetching}
            isFirstPage={page === 1}
            isLastPage={page === data?.totalPages}
            nextPageHandler={() =>
              setPage(p => (p < data?.totalPages ? p + 1 : p))
            }
            prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
          />
        )}
      </div>
    </div>
  )
}
