const getHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Invalid or expired user token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getDoctorsService = async () => {
  try {
    const res = await fetch("http://localhost:4000/admin/doctors", {
      headers: getHeaders(),
    });
    console.log("doctors res: ", res);

    if (!res.ok) {
      throw new Error("Error fetching doctors from servers");
    }
    const data = await res.json();
    console.log("doctors service data: ", data);

    const doctors = data.doctors;
    console.log("doctors data: ", doctors);

    return doctors.map((doctor) => doctor);
  } catch (error) {
    console.error("Admin-Doctors: ", error.message);
    throw error;
    // return []; // safe fallback
  }
};

export const getDoctorService = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/admin/doctor/${id}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error fetching doctor profile from server");
    }

    const data = await res.json();
    const doctor = data.doctor;
    console.log("get doctor service: ", doctor);

    /* if (Array.isArray(doctor)) {
      return {
        id: doctor._id,
        name: doctor.name,
      };
    } */

    return doctor;
  } catch (error) {
    console.error("doctor query error: ", error.message);
    throw error;
  }
};

export const updateDoctorService = async (id, updateData) => {
  try {
    const res = await fetch(`http://localhost:4000/admin/doctor/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      throw new Error("Error updating doctor profile");
    }
    const data = await res.json();
    const doctor = data.doctor;
    return doctor;
  } catch (error) {
    console.error("error updating doctor service: ", error.message);
    throw error;
  }
};

export const createDoctorService = async (formData) => {
  try {
    const res = await fetch("http://localhost:4000/admin/create-doctor", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      throw new Error("error creating doctor profile");
    }
    const data = await res.json();

    console.log("created doctor profile: ", data.doctor);
    return data.doctor;
  } catch (error) {
    console.error("Error creating doctor profile: ", error.message);
    throw error;
  }
};

export const archiveDoctorService = async (id, formData) => {
  try {
    const res = await fetch(
      `http://localhost:4000/admin/archive-doctor/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      }
    );
    if (!res.ok) {
      throw new Error("failed to archive doctor profile");
    }

    const data = await res.json();
    const doctor = data.doctor;

    return doctor;
  } catch (error) {
    console.error("Error archiving doctor: ", error.message);
    throw error;
  }
};

export const unarchiveDoctorService = async (id, formData) => {
  try {
    const res = await fetch(
      `http://localhost:4000/admin/unarchive-doctor/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      }
    );
    if (!res.ok) {
      throw new Error("failed to unarchive doctor profile");
    }

    const data = await res.json();
    const doctor = data.doctor;

    return doctor;
  } catch (error) {
    console.error("Error unarchiving doctor: ", error.message);
    throw error;
  }
};
