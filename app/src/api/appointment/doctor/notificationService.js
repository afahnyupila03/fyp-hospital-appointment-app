

const getHeaders = () => {
  const token = localStorage.getItem('token')

  if (!token)
    throw new Error(
      'Invalid or expired user token, please authenticate user again.'
    )

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

const URL = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor/notification`
const DELETE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor/delete-notification`

export const requestDoctorNotificationPermission = async granted => {
  const res = await fetch(
    `${URL}-permission`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(granted)
    }
  )
  const data = await res.json()

  if (!res.ok)
    throw new Error(data.message || 'permission request not granted.')

  return data.message
}

export const viewDoctorNotifications = async (page, limit) => {
  const res = await fetch(
    `${URL}s?page=${page}&limit=${limit}`,
    {
      headers: getHeaders()
    }
  )

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || (data.error && data.message))

  const notifications = data.notifications
  const count = data.count
  const currentPage = data.currentPage
  const totalPages = data.totalPages

  return { notifications, count, currentPage, totalPages }
}

export const viewDoctorNotification = async id => {
  const res = await fetch(`${URL}/${id}`, {
    headers: getHeaders()
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.error || data.message)

  return data.notification
}

export const updateDoctorNotificationStatus = async (id, status) => {
  const res = await fetch(
    `${URL}/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(status)
    }
  )

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || (data.error && data.message))

  const { notification } = data

  return notification
}

export const deleteDoctorNotification = async id => {
  const res = await fetch(
    `${DELETE_URL}/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders()
    }
  )

  const data = await res.json()

  if (!res.ok) throw new Error(data.message)

  return data
}
