'use client'

import Dropdown from '@/components/Dropdown'
import Table from '@/components/Table'
import {
  useDoctorNotifications,
  useUpdateDoctorNotification,
  useDeleteDoctorNotification
} from '@/hooks/doctor/useDoctorNotification'
import { useState } from 'react'

const notificationDate = createdAt => {
  if (!createdAt) return 'No date'

  const now = new Date()
  const created = new Date(createdAt)
  const diffInSeconds = Math.floor((now - created) / 1000)

  if (diffInSeconds < 60)
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
}

const notificationActions = notification => {
  const status = notification.status
  const id = notification._id

  const actions = {
    read: [
      {
        id,
        type: 'link',
        label: 'View',
        link: `notifications/${notification._id}`
      },
      {
        id,
        type: 'button',
        actionKey: 'delete',
        label: 'Delete'
      }
    ],
    unread: [
      {
        type: 'button',
        actionKey: 'read',
        label: 'Mark as read',
        id
      },
      {
        id,
        type: 'link',
        label: 'View',
        link: `notifications/${notification._id}`
      },
      {
        id,
        type: 'button',
        actionKey: 'delete',
        label: 'Delete'
      }
    ]
  }

  return actions[status] || []
}

const notificationType = type => {
  const types = {
    appointment_request: 'Appointment Request',
    appointment_request_update: 'Appointment Request Update',
    appointment_status_update: 'Appointment Status Update',
    general: 'General'
  }
  return types[type] || 'Unknown'
}

export default function DoctorNotificationPage () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isFetching, isError, error, refetch } =
    useDoctorNotifications(page, limit)

  const { mutateAsync: updateNotification } = useUpdateDoctorNotification()
  const { mutateAsync: deleteNotification } = useDeleteDoctorNotification()

  if (isLoading)
    return (
      <p className='text-center mt-10 text-gray-500'>
        Loading notifications...
      </p>
    )
  if (isError)
    return (
      <p className='text-red-500 text-center mt-10'>Error: {error?.message}</p>
    )

  const isFirstPage = page === 1
  const isLastPage = page === data?.totalPages
  const currentPage = data?.currentPage
  const totalPages = data?.totalPages
  const count = data?.count

  const markAsReadHandler = async id => {
    try {
      await updateNotification({ id, status: 'read' })
      refetch()
    } catch (error) {
      console.error("Error updating notification status to 'read':", error)
    }
  }

  const deleteNotificationHandler = async id => {
    try {
      await deleteNotification({ id })
      refetch()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const tableHeaders = (
    <>
      <th className='py-4 px-6 text-left text-sm text-gray-500 uppercase tracking-wider'>
        S/N
      </th>
      <th className='py-4 px-6 text-left text-sm text-gray-500 uppercase tracking-wider'>
        Type
      </th>
      <th className='py-4 px-6 text-left text-sm text-gray-500 uppercase tracking-wider'>
        Message
      </th>
      <th className='py-4 px-6 text-left text-sm text-gray-500 uppercase tracking-wider'>
        Time
      </th>
      <th className='py-4 px-6 text-left'></th>
    </>
  )

  const tableData = count === 0 ? (
      <tr>
        <td colSpan={7} className='text-center py-10 text-gray-500'>
          No notifications
        </td>
      </tr>
    ) :  data?.notifications?.map((notification, index) => (
    <tr key={notification._id} className='hover:bg-gray-50'>
      <td className='py-3 px-6'>{(page - 1) * limit + index + 1}</td>
      <td className='py-3 px-6'>{notificationType(notification.type)}</td>
      <td className='py-3 px-6'>{notification.message}</td>
      <td className='py-3 px-6 text-gray-500'>
        {notificationDate(notification.createdAt)}
      </td>
      <td className='py-3 px-6'>
        <Dropdown
          actions={notificationActions(notification)}
          actionHandler={action => {
            if (action.actionKey === 'read') {
              markAsReadHandler(notification._id)
            } else {
              deleteNotificationHandler(notification._id)
            }
          }}
        />
      </td>
    </tr>
  ))

  return (
    <div className='max-w-6xl mx-auto p-4'>
      <h1 className='text-2xl font-semibold text-gray-800 mb-6'>
        Doctor Notifications
      </h1>
      <div className='bg-white shadow-md rounded-lg '>
        <Table
          tableHeaders={tableHeaders}
          tableData={tableData}
          currentPage={currentPage}
          totalPages={totalPages}
          isFetching={isFetching}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          nextPageHandler={() =>
            setPage(p => (p < data?.totalPages ? p + 1 : p))
          }
          prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
        />
      </div>
    </div>
  )
}
