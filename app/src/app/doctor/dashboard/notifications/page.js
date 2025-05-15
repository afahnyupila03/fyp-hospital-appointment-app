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
  if (!createdAt) {
    return 'No date'
  }

  const now = new Date()
  const created = new Date(createdAt)
  const diffInSeconds = Math.floor((now - created) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
}

const notificationActions = notification => {
  switch (notification.status) {
    case 'read':
      return [
        {
          id: notification._id,
          type: 'link',
          label: 'View',
          link: `notifications/${notification._id}`
        },
        {
          id: notification._id,
          type: 'button',
          actionKey: 'delete',
          label: 'Delete'
        }
      ]
    case 'unread':
      return [
        {
          type: 'button',
          actionKey: 'read',
          label: 'Mark as read',
          id: notification._id
        },
        {
          id: notification._id,
          type: 'link',
          label: 'View',
          link: `notifications/${notification._id}`
        },
        {
          id: notification._id,
          type: 'button',
          actionKey: 'delete',
          label: 'Delete'
        }
      ]
    default:
      return []
  }
}

const notificationType = type => {
  const types = {
    appointment_request: 'Appointment Request',
    appointment_request_update: 'Appointment Requested Update',
    appointment_status_update: 'Appointment Status Update.',
    general: 'General'
  }

  return types[type] || ''
}

export default function DoctorNotificationPage () {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading, isFetching, isError, error, refetch } =
    useDoctorNotifications(page, limit)

  const { mutateAsync: updateNotification } = useUpdateDoctorNotification()
  const { mutateAsync: deleteNotification } = useDeleteDoctorNotification()

  if (isLoading) return <p>Loading notifications</p>
  if (isError) return <p>{error}</p>

  const isFirstPage = page === 1
  const isLastPage = page === data.totalPages
  const currentPage = data.currentPage
  const totalPages = data.totalPages

  const markAsReadHandler = async id => {
    try {
      await updateNotification({
        id,
        status: 'read'
      })
      console.log(`notification status updated to [read] with id ${id}`)
      refetch()
    } catch (error) {
      console.error("error updating notification status to ['read'] :", error)
      throw new Error(error)
    }
  }
  const deleteNotificationHandler = async id => {
    console.log('Performing delete action...')
    await deleteNotification({ id })
    console.log('Delete doctor notification success')
    refetch()
  }

  const tableHeaders = (
    <>
      <th className='py-4 px-6'>S/N</th>
      <th className='py-4 px-6'>Appointment Type</th>
      <th className='py-4 px-6'>Message</th>
      <th className='py-4 px-6'>Time</th>
      <th className='py-4 px-6'></th>
    </>
  )

  const tableData = data?.notifications?.map((notification, index) => (
    <tr key={notification._id}>
      <td>{index + 1}</td>
      <td>{notificationType(notification.type)}</td>
      <td>{notification.message}</td>
      <td>{notificationDate(notification.createdAt)}</td>
      <td>
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
    <div>
      <Table
        tableHeaders={tableHeaders}
        tableData={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        isFetching={isFetching}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        nextPageHandler={() => setPage(p => (p < data?.totalPages ? p + 1 : p))}
        prevPageHandler={() => setPage(p => Math.max(p - 1, 1))}
      />
    </div>
  )
}
