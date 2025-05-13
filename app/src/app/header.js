'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, PopoverGroup } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { AppState } from '@/store/context'
import Link from 'next/link'

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

import Notification from '@/components/Notification'

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

  if (!user) return '/'

  const roleRoutes = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    patient: '/patient/dashboard'
  }

  return roleRoutes[role] || '/'
}

export const Header = () => {
  const { user, loading } = AppState()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const {
    data: doctorNotifications,
    isLoading: doctorLoading,
    refetch: refetchDoctorNotifications
  } = useDoctorNotifications()

  const {
    data: patientNotifications,
    isLoading: patientLoading,
    refetch: refetchPatientNotifications
  } = usePatientNotifications()

  const notifications =
    doctorNotifications?.notifications ??
    patientNotifications?.notifications ??
    []

  const notificationCount =
    notifications?.filter(notification => notification.status === 'unread')
      .length || 0

  const { mutateAsync: updateNotification } = useUpdateDoctorNotification()
  const { mutateAsync: deleteNotification } = useDeleteDoctorNotification()

  const markAsReadHandler = async id => {
    try {
      await updateNotification({
        id,
        status: 'read'
      })
      console.log(`notification status updated to [read] with id ${id}`)
      refetchDoctorNotifications()
    } catch (error) {
      console.error("error updating notification status to ['read'] :", error)
      throw new Error(error)
    }
  }

  const deleteNotificationHandler = async id => {
    console.log('Performing delete action...')
    await deleteNotification({ id })
    console.log('Delete doctor notification success')
    refetchDoctorNotifications()
  }

  const links = userLinks(user)

  if (loading) return <div>Loading.....</div>
  console.log(
    'patient notifications: ',
    notifications,
    ' count: ',
    notificationCount
  )

  return (
    <header className='bg-white'>
      <nav
        aria-label='Global'
        className='mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8'
      >
        <div className='flex lg:flex-1'>
          {user ? (
            <Link href={redirectByUserRole(user)} className='-m-1.5 p-1.5'>
              <span className='sr-only'>CareConnect</span>
              <img alt='' src='../favicon.ico' className='h-8 w-auto' />
            </Link>
          ) : (
            <button
              disabled
              className='cursor-not-allowed opacity-50 -m-1.5 p-1.5'
              aria-disabled='true'
            >
              <span className='sr-only'>CareConnect</span>
              <img alt='' src='../favicon.ico' className='h-8 w-auto' />
            </button>
          )}
        </div>
        {/* Button */}
        {user && (
          <div className='flex lg:hidden'>
            <button
              type='button'
              onClick={() => setMobileMenuOpen(true)}
              className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            >
              <span className='sr-only'>Open main menu</span>
              <Bars3Icon aria-hidden='true' className='size-6' />
            </button>
          </div>
        )}

        <PopoverGroup className='hidden lg:flex lg:gap-x-12'>
          {user &&
            links.map((link, index) => (
              <Link href={link.href} key={index}>
                {link.name}
              </Link>
            ))}
        </PopoverGroup>

        <div className='hidden lg:flex lg:flex-1 lg:justify-end items-center'>
          {user && (user.role === 'doctor' || user.role === 'patient') && (
            <div className='flex items-center justify-center gap-4'>
              <Notification
                notifications={notifications}
                notificationCounter={notificationCount}
                notificationHandler={markAsReadHandler}
                deleteHandler={deleteNotificationHandler}
              />
              <button
                type='button'
                className='px-4 py-2 bg-red-500 text-white rounded'
              >
                Logout big
              </button>
            </div>
          )}
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className='lg:hidden'
      >
        <div className='fixed inset-0 z-10' />
        <DialogPanel className='fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            {user ? (
              <Link
                href={redirectByUserRole(user.role)}
                className='-m-1.5 p-1.5'
              >
                <span className='sr-only'>CareConnect</span>
                <img alt='' src='../favicon.ico' className='h-8 w-auto' />
              </Link>
            ) : (
              <button
                disabled
                className='cursor-not-allowed opacity-50 -m-1.5 p-1.5'
                aria-disabled='true'
              >
                <span className='sr-only'>CareConnect</span>
                <img alt='' src='../favicon.ico' className='h-8 w-auto' />
              </button>
            )}
            <button
              type='button'
              onClick={() => setMobileMenuOpen(false)}
              className='-m-2.5 rounded-md p-2.5 text-gray-700'
            >
              <span className='sr-only'>Close menu</span>
              <XMarkIcon aria-hidden='true' className='size-6' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='-my-6 divide-y divide-gray-500/10'>
              <div className='space-y-2 py-6'>
                {user &&
                  links.map((link, index) => (
                    <Link href={link.href} key={index}>
                      {link.name}
                    </Link>
                  ))}
              </div>
              <div className='py-6'>
                {user && (user.role === 'doctor' || user.role === 'patient') && (
                  <>
                    <Notification
                      notifications={notifications}
                      notificationCounter={notificationCount}
                    />

                    <button type='button'>Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
