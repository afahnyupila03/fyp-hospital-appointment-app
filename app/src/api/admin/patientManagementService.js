const getHeaders = () => {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available on the server.')
  }

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

export const getPatientsService = async (page, limit) => {
  try {
    const res = await fetch(
      `http://localhost:4000/admin/view-patients?page=${page}&limit=${limit}`,
      {
        headers: getHeaders()
      }
    )

    const data = await res.json()

    if (!res.ok) throw new Error(data.error || data.message)

    const patients = data.patients
    const count = data.count
    const totalPages = data.totalPages
    const currentPage = data.currentPage

    return { patients, count, totalPages, currentPage }
  } catch (error) {
    console.error('error fetching patients from servers: ', error.message)
    throw new Error(error.message)
  }
}

// export const getAppointmentsService = async () => {}

export const getPatientService = async id => {
  try {
    const res = await fetch(`http://localhost:4000/admin/view-patient/${id}`, {
      headers: getHeaders()
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || data.message)
    }

    return data.patient
  } catch (error) {
    console.error('server error fetching patient profile: ', error.message)
    throw error
  }
}

export const archivePatientService = async (id, data) => {
  const res = await fetch(`http://localhost:4000/admin/archive-patient/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.error || result.message)
  }

  const patient = result.patient

  return patient
}

export const unarchivePatientService = async (id, data) => {
  const res = await fetch(
    `http://localhost:4000/admin/unarchive-patient/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }
  )

  const result = await res.json()

  if (!res.ok) {
    throw new Error(data.error)
  }

  return result.patient
}
