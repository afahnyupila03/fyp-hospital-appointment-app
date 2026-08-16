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

const URL = `${process.env.NEXT_PUBLIC_BASE_URL}/doctor`

export const viewAppointmentsService = async (page, limit) => {
  const res = await fetch(
    `${URL}/view-appointments?page=${page}&limit=${limit}`,
    {
      headers: getHeaders()
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.message)

  const appointments = data.appointments
  const count = data.count
  const currentPage = data.currentPage
  const totalPages = data.totalPages
  const message = data?.message

  return { message, appointments, count, currentPage, totalPages }
}

export const viewAppointmentService = async id => {
  const res = await fetch(
    `${URL}/view-appointment/${id}`,
    {
      headers: getHeaders()
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)

  const appointment = data.appointment

  return appointment
}

export const updateAppointmentService = async (id, status) => {
  const res = await fetch(
    `${URL}/update-appointment/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(status)
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.message)

  const updatedAppointment = data.updatedAppointment

  return updatedAppointment
}
