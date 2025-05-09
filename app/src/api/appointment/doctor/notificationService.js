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

export const viewDoctorNotifications = async () => {
  const res = await fetch("http://localhost:4000/doctor/notifications", {
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || (data.error && data.message));

  const { notifications, count } = data;

  return { notifications, count };
};

export const viewDoctorNotification = async (id) => {
  const res = await fetch(`http://localhost:4000/doctor/notification/${id}`, {
    headers: getHeaders(),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || (data.error && data.message));

  const { notification } = data;

  return notification;
};

export const updateDoctorNotificationStatus = async (id, payload) => {
  const res = await fetch(
    `http://localhost:4000/doctor/update-notification/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || (data.error && data.message));

  const { notification } = data;

  return notification;
};
