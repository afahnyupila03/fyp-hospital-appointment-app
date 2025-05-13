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
  const res = await fetch('http://localhost:4000/patient/create-appoinment', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(formData)
  })
  if (!res.ok) throw new Error('Error creating patient appointment')

  const result = await res.json()
  const createdAppointment = result.data

  return createdAppointment
}

export const viewAppointmentsService = async (page, limit) => {
  const res = await fetch(
    `http://localhost:4000/patient/view-appointments?page=${page}&limit=${limit}`,
    {
      headers: getHeaders()
    }
  )
  if (!res.ok) throw new Error('Error fetching doctors appointments')

  const data = await res.json()
  const appointments = data.appointments

  return appointments
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

export const viewDoctorsService = async () => {
  try {
    const res = await fetch('http://localhost:4000/patient/doctors', {
      headers: getHeaders()
    })
    console.log('doctors res: ', res)

    if (!res.ok) {
      throw new Error('Error fetching doctors from servers')
    }
    const data = await res.json()

    const doctors = data.doctors
    console.log('doctors data: ', doctors)

    return doctors
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

    if (!res.ok) {
      throw new Error('Error fetching doctor profile from server')
    }

    const data = await res.json()
    const doctor = data.doctor
    console.log('get doctor service: ', doctor)

    if (Array.isArray(doctor)) {
      return {
        id: doctor._id,
        name: doctor.name
      }
    }

    return {
      id: doctor._id,
      name: doctor.name
    }
  } catch (error) {
    console.error('doctor query error: ', error.message)
    throw error
  }
}
