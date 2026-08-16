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

export const PATIENT_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/patient`

export const requestPatientNotificationPermission = async granted => {
  const res = await fetch(
    `${PATIENT_URL}/notification-permission`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(granted)
    }
  )

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || (data.message && data.error))

  return data.message
}

export const viewPatientNotifications = async (page, limit) => {
  const res = await fetch(
    `${PATIENT_URL}/notifications?page=${page}&limit=${limit}`,
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

export const viewPatientNotification = async id => {
  const res = await fetch(`${PATIENT_URL}/notification/${id}`, {
    headers: getHeaders()
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || (data.error && data.message))

  const { notification } = data

  return notification
}

export const updatePatientNotificationStatus = async (id, payload) => {
  const res = await fetch(
    `${PATIENT_URL}/update-notification/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }
  )

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || (data.error && data.message))

  const { notification } = data

  return notification
}

export const deletePatientNotification = async id => {
  const res = await fetch(
    `${PATIENT_URL}/delete-notification/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders()
    }
  )

  const data = await res.json()

  if (!res.ok) throw new Error(data.message)

  return data
}
