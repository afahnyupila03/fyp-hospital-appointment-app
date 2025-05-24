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
  const res = await fetch('http://localhost:4000/patient/create-appointment', {
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
    `http://localhost:4000/patient/view-appointments?page=${page}&limit=${limit}`,
    {
      headers: getHeaders()
    }
  )

  const data = await res.json()
  if (!res.ok)
    throw new Error(
      data.message || data.error || 'Error fetching doctors appointments'
    )

  const appointments = data.appointments
  const count = data.count
  const currentPage = data.currentPage
  const totalPages = data.totalPages

  return { appointments, count, currentPage, totalPages }
}

export const viewAppointmentService = async id => {
  const res = await fetch(
    `http://localhost:4000/patient/view-appointment/${id}`,
    {
      headers: getHeaders()
    }
  )
  console.log('patient appointment res: ', res)
  if (!res.ok) throw new Error('Error fetching doctor appointment')
  const data = await res.json()
  const appointment = data.appointment

  return appointment
}

export const updateAppointmentService = async (id, formData) => {
  const res = await fetch(
    `http://localhost:4000/patient/update-appointment/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    }
  )
  if (!res.ok) throw new Error('Error fetching doctor appointment')
  const data = await res.json()
  const updatedAppointment = data.updatedAppointment

  return updatedAppointment
}

export const viewDoctorsService = async (page, limit) => {
  try {
    const res = await fetch(
      `http://localhost:4000/patient/doctors?page=${page}&limit=${limit}`,
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
    const res = await fetch(`http://localhost:4000/patient/doctor/${id}`, {
      headers: getHeaders()
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error)
    }

    const doctor = data.doctor

    return doctor
  } catch (error) {
    console.error('doctor query error: ', error.message)
    throw error
  }
}
