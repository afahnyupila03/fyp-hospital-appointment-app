import { PATIENT_URL } from './patientNotificationService'

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

export const createAppointmentService = async formData => {
  const res = await fetch(`${PATIENT_URL}/create-appointment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(formData)
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.error || data.message)

  return data.appointment
}

export const viewAppointmentsService = async (page, limit) => {
  const res = await fetch(
    `${PATIENT_URL}/view-appointments?page=${page}&limit=${limit}`,
    {
      headers: getHeaders()
    }
  )

  const data = await res.json()
  if (!res.ok)
    throw new Error(
      data.message || data.error || 'Error fetching doctors appointments'
    )

  const appointments = data?.appointments
  const count = data.count
  const message = data?.message
  const currentPage = data.currentPage
  const totalPages = data.totalPages

  if (count === 0)
    return { count, message, currentPage, totalPages, appointments: [] }

  return { appointments, count, currentPage, totalPages }
}

export const viewAppointmentService = async id => {
  const res = await fetch(`${PATIENT_URL}/view-appointment/${id}`, {
    headers: getHeaders()
  })
  console.log('patient appointment res: ', res)
  if (!res.ok) throw new Error('Error fetching doctor appointment')
  const data = await res.json()
  const appointment = data.appointment

  return appointment
}

export const updateAppointmentService = async (id, payload) => {
  const res = await fetch(`${PATIENT_URL}/update-appointment/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.error || data.message)

  const updatedAppointment = data.updatedAppointment

  return updatedAppointment
}

export const viewDoctorsService = async (page, limit) => {
  try {
    const res = await fetch(
      `${PATIENT_URL}/doctors?page=${page}&limit=${limit}`,
      {
        headers: getHeaders()
      }
    )
    console.log('doctors res: ', res)

    const data = await res.json()

    if (!res.ok) {
      throw new Error(
        data.message ||
          data.error ||
          'Error fetching doctors for patient from servers'
      )
    }

    const doctors = data.doctors
    const count = data.count
    const currentPage = data.currentPage
    const totalPages = data.totalPages
    console.log('doctors data: ', doctors)

    return { doctors, count, currentPage, totalPages }
  } catch (error) {
    console.error('Admin-Doctors: ', error.message)
    throw error
    // return []; // safe fallback
  }
}

export const viewDoctorService = async id => {
  try {
    const res = await fetch(`${PATIENT_URL}/doctor/${id}`, {
      headers: getHeaders()
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || data.message)
    }

    const doctor = data.doctor

    return doctor
  } catch (error) {
    console.error('doctor query error: ', error.message)
    throw error
  }
}
