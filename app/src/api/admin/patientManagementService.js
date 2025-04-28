const getHeaders = () => {
  if (typeof window === "undefined") {
    throw new Error("localStorage is not available on the server.");
  }

  const token = localStorage.getItem("token");
  if (!token)
    throw new Error(
      "Invalid or expired user token, please authenticate user again."
    );

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getPatientsService = async () => {
  try {
    const res = await fetch("http://localhost:4000/admin/view-patients", {
      headers: getHeaders(),
    });
    console.log("patients res: ", res);
    if (!res.ok) throw new Error("error querying patients");

    const data = await res.json();
    const patients = data.patients;
    const count = data.count;
    console.log("service: ", data);

    return { patients, count };
  } catch (error) {
    console.error("error fetching patients from servers: ", error.message);
    throw error;
  }
};

export const getAppointmentsService = async () => {};

export const getPatientService = async (id) => {
  try {
    const res = await fetch(`http://localhost:4000/admin/view-patient/${id}`, {
      headers: getHeaders(),
    });
    console.log("patient res: ", res);

    if (!res.ok) {
      throw new Error("Error fetching patient profile from server");
    }

    const data = await res.json();
    console.log("patient data: ", data);
    const patient = data.patient;
    console.log("patients: ", patient);

    return patient;
  } catch (error) {
    console.error("server error fetching patient profile: ", error.message);
    throw error;
  }
};

export const archivePatientService = async (id, data) => {
  const res = await fetch(`http://localhost:4000/admin/archive-patient/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Error updating patient isActive state");
  }
  const result = res.json();
  const patient = result.patient;

  return patient;
};

export const unarchivePatientService = async (id, data) => {
  const res = await fetch(
    `http://localhost:4000/admin/unarchive-patient/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to unarchive patient");
  }

  const result = await res.json();

  return result.patient;
};
