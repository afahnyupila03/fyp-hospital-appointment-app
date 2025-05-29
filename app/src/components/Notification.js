import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { AppState } from '@/store/context'

const styles = {
  notificationWrapper: {
    position: 'relative',
    display: 'inline-block'
  },
  notificationCounter: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    color: 'white',
    backgroundColor: '#ef4444', // red badge
    borderRadius: '9999px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 'bold',
    zIndex: 10,
    minWidth: '18px',
    textAlign: 'center',
    lineHeight: '1'
  }
}

const notificationType = type => {
  const types = {
    appointment_request: 'Appointment Request',
    appointment_request_update: 'Appointment Request Update',
    appointment_status_update: 'Appointment Status Update',
    general: 'General'
  }

  return types[type] || ''
}

const messageDate = createdAt => {
  if (!createdAt) return 'No date'

  const now = new Date()
  const created = new Date(createdAt)
  const seconds = Math.floor((now - created) / 1000)

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function Notification ({
  notificationCounter,
  notifications,
  notificationHandler,
  deleteHandler
}) {
  const { user } = AppState()
  const role = user?.role || '#'

  return (
    <Menu as='div' className='relative inline-block text-left'>
      <div
        title={`${notificationCounter} unread message${notificationCounter > 1 ? 's' : ''}`}
        style={styles.notificationWrapper}
      >
        <MenuButton className='inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-200 transition'>
          <BellIcon className='w-7 h-7 text-gray-600' aria-hidden='true' />
        </MenuButton>
        {notificationCounter > 0 && (
          <div style={styles.notificationCounter}>{notificationCounter}</div>
        )}
      </div>

      <MenuItems
        className='absolute right-0 z-20 mt-2 w-80 max-h-96 overflow-y-auto origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'
      >
        {notificationCounter > 0 ? (
          <>
            <div className='divide-y divide-gray-200'>
              {notifications?.slice(0, 5).map(notification => (
                <MenuItem key={notification._id}>
                  {({ active }) => (
                    <div
                      className={`px-4 py-3 text-sm ${
                        active ? 'bg-gray-50' : ''
                      }`}
                    >
                      <p className='font-semibold text-gray-800'>
                        {notificationType(notification.type)}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {messageDate(notification.createdAt)}
                      </p>
                      <div className='flex items-center justify-between mt-2 gap-2'>
                        {notification.status === 'unread' ? (
                          <button
                            className='text-blue-600 text-xs hover:underline'
                            onClick={() => notificationHandler(notification._id)}
                          >
                            Mark as read
                          </button>
                        ) : (
                          <span className='w-[80px]' />
                        )}

                        <button
                          className='text-red-600 text-xs hover:underline'
                          onClick={() => deleteHandler(notification._id)}
                        >
                          Delete
                        </button>

                        <Link
                          href={`/${role}/dashboard/notifications/${notification._id}`}
                          className='text-green-600 text-xs hover:underline'
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  )}
                </MenuItem>
              ))}
            </div>

            <div className='p-3 border-t border-gray-200 text-right'>
              <Link
                href={`/${role}/dashboard/notifications`}
                className='text-sm text-blue-600 hover:underline'
              >
                See all
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className='p-4 text-center text-sm text-gray-500'>
              No unread notifications
            </div>
            <div className='p-3 border-t text-right'>
              <Link
                href={`/${role}/dashboard/notifications`}
                className='text-sm text-blue-600 hover:underline'
              >
                See all
              </Link>
            </div>
          </>
        )}
      </MenuItems>
    </Menu>
  )
}
