const getHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Invalid or expired user token')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export const getDoctorsService = async (page, limit) => {
  try {
    const res = await fetch(
      `http://localhost:4000/admin/doctors?page=${page}&limit=${limit}`,
      {
        headers: getHeaders()
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || data.message)
    }

    const doctors = data.doctors
    const count = data.count
    const currentPage = data.currentPage
    const totalPages = data.totalPages

    return { doctors, count, currentPage, totalPages }
  } catch (error) {
    console.error('Admin-Doctors: ', error.message)
    throw error
    // return []; // safe fallback
  }
}

export const getDoctorService = async id => {
  try {
    const res = await fetch(`http://localhost:4000/admin/doctor/${id}`, {
      headers: getHeaders()
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || data.message)
    }

    
    const doctor = data.doctor
    console.log('get doctor service: ', doctor)

    /* if (Array.isArray(doctor)) {
      return {
        id: doctor._id,
        name: doctor.name,
      };
    } */

    return doctor
  } catch (error) {
    console.error('doctor query error: ', error.message)
    throw error
  }
}

export const updateDoctorService = async (id, updateData) => {
  try {
    const res = await fetch(`http://localhost:4000/admin/update-doctor/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    const doctor = data.doctor
    return doctor
  } catch (error) {
    console.error('error updating doctor service: ', error.message)
    throw error
  }
}

export const createDoctorService = async formData => {
  try {
    const res = await fetch('http://localhost:4000/admin/create-doctor', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    console.log('created doctor profile: ', data.doctor)
    return data.doctor
  } catch (error) {
    console.error('Error creating doctor profile: ', error)
    throw error
  }
}

export const archiveDoctorService = async (id, formData) => {
  try {
    const res = await fetch(
      `http://localhost:4000/admin/archive-doctor/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      }
    )
    if (!res.ok) {
      throw new Error('failed to archive doctor profile')
    }

    const data = await res.json()
    const doctor = data.doctor

    return doctor
  } catch (error) {
    console.error('Error archiving doctor: ', error.message)
    throw error
  }
}

export const unarchiveDoctorService = async (id, formData) => {
  try {
    const res = await fetch(
      `http://localhost:4000/admin/unarchive-doctor/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      }
    )
    if (!res.ok) {
      throw new Error('failed to unarchive doctor profile')
    }

    const data = await res.json()
    const doctor = data.doctor

    return doctor
  } catch (error) {
    console.error('Error unarchiving doctor: ', error.message)
    throw error
  }
}
