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

export const viewAppointmentsService = async () => {
  const res = await fetch("http://localhost:4000/doctor/view-appointments", {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Error fetching doctors appointments");

  const data = await res.json();
  const appointments = data.appointments;

  return appointments;
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
