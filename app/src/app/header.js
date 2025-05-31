'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppState } from '@/store/context'
import Notification from '@/components/Notification'
import {
  useDoctorNotifications,
  useUpdateDoctorNotification,
  useDeleteDoctorNotification
} from '@/hooks/doctor/useDoctorNotification'
import {
  usePatientNotifications,
  useUpdatePatientNotification,
  useDeletePatientNotification
} from '@/hooks/patient/usePatientNotification'

const userLinks = user => {
  if (!user) return []

  const role = user.role

  const routes = {
    admin: [
      { name: 'Create Doctor', href: '/admin/dashboard/doctors/create-doctor' },
      { name: 'Doctors', href: '/admin/dashboard/doctors' },
      { name: 'Patients', href: '/admin/dashboard/patients' }
    ],
    doctor: [{ name: 'Appointments', href: '/doctor/dashboard/appointments' }],
    patient: [
      { name: 'Book Appointment', href: '/patient/dashboard/book-appointment' },
      { name: 'Appointments', href: '/patient/dashboard/appointments' },
      { name: 'Doctors', href: '/patient/dashboard/doctors' }
    ]
  }

  return routes[role] || []
}

const redirectByUserRole = user => {
  const role = user.role
  const roleRoutes = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    patient: '/patient/dashboard'
  }

  return roleRoutes[role] || '/'
}

export const Header = () => {
  const { user, loading, signoutHandler } = AppState()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDoctor = user?.role === 'doctor'
  const isPatient = user?.role === 'patient'

  const { data: doctorNotifications, refetch: refetchDoctorNotifications } =
    useDoctorNotifications(isDoctor)
  const { data: patientNotifications, refetch: refetchPatientNotifications } =
    usePatientNotifications(isPatient)

  useEffect(() => {
    if (isDoctor) refetchDoctorNotifications()
    if (isPatient) refetchPatientNotifications()
  }, [isDoctor, isPatient])

  const notifications = isDoctor
    ? doctorNotifications?.notifications
    : isPatient
    ? patientNotifications?.notifications
    : []

  const notificationCount =
    notifications?.filter(n => n.status === 'unread').length || 0

  const { mutateAsync: updateNotification } =
    useUpdateDoctorNotification(isDoctor)
  const { mutateAsync: deleteNotification } =
    useDeleteDoctorNotification(isDoctor)
  const { mutateAsync: updatePatientNotification } =
    useUpdatePatientNotification(isPatient)
  const { mutateAsync: deletePatientNotification } =
    useDeletePatientNotification(isPatient)

  const markAsReadHandler = async id => {
    if (isDoctor) {
      await updateNotification({ id, status: 'read' })
      refetchDoctorNotifications()
    } else if (isPatient) {
      await updatePatientNotification({ id, payload: 'read' })
      refetchPatientNotifications()
    }
  }

  const deleteNotificationHandler = async id => {
    if (isDoctor) {
      await deleteNotification({ id })
      refetchDoctorNotifications()
    } else if (isPatient) {
      await deletePatientNotification({ id })
      refetchPatientNotifications()
    }
  }

  const links = userLinks(user)

  if (loading) return null

  return (
    <aside className='w-64 bg-white border-r p-6 flex flex-col justify-between min-h-screen'>
      <div>
        {/* Logo */}
        <div className='mb-8'>
          {user ? (
            <Link
              href={redirectByUserRole(user)}
              className='flex items-center gap-2'
            >
              <img src='../favicon.ico' alt='Logo' className='h-8 w-auto' />
              <span className='font-semibold'>CareConnect</span>
            </Link>
          ) : (
            <div className='flex items-center gap-2 opacity-50'>
              <img src='../favicon.ico' alt='Logo' className='h-8 w-auto' />
              <span className='font-semibold'>CareConnect</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        {user && (
          <nav className='space-y-4'>
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className='text-gray-700 hover:text-blue-500 block'
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Notifications and Logout */}
      {user && (user.role === 'doctor' || user.role === 'patient') && (
        <div className='space-y-4 mt-8'>
          <Notification
            notifications={notifications}
            notificationCounter={notificationCount}
            notificationHandler={markAsReadHandler}
            deleteHandler={deleteNotificationHandler}
          />
          <button
            onClick={() => signoutHandler(user.role)}
            className='w-full py-2 bg-red-500 text-white rounded hover:bg-red-600'
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  )
}
