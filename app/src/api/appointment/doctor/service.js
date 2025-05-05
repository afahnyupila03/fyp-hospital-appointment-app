const getHeaders = () => {
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

export const viewAppointmentsService = async (page, limit = 10) => {
  const res = await fetch(
    `http://localhost:4000/doctor/view-appointments?page=${page}&limit=${limit}`,
    {
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error fetching doctors appointments");

  const data = await res.json();
  const appointments = data.appointments;
  const count = data.count;
  const currentPage = data.currentPage;
  const totalPages = data.totalPages;

  return { appointments, count, currentPage, totalPages };
};

export const viewAppointmentService = async (id) => {
  const res = await fetch(
    `http://localhost:4000/doctor/view-appointment/${id}`,
    {
      headers: getHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error fetching doctor appointment");
  const data = await res.json();
  const appointment = data.appointment;

  return appointment;
};

export const updateAppointmentService = async (id, formData) => {
  const res = await fetch(
    `http://localhost:4000/doctor/update-appointment/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(formData),
    }
  );
  if (!res.ok) throw new Error("Error fetching doctor appointment");
  const data = await res.json();
  const updatedAppointment = data.updatedAppointment;

  return updatedAppointment;
};
