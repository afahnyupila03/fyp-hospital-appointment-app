"use client";

import {
  useDoctorAppointments,
  useUpdateDoctorAppointment,
} from "@/hooks/doctor/useDoctor";
import { AppState } from "@/store/context";

import { UserCard } from "@/components/UserCard";
import { DoughnutChart, BarChart } from "@/components/Chart";
import { useEffect, useState } from "react";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import Dropdown from "@/components/Dropdown";
import { useDoctorNotificationPermission } from "@/hooks/doctor/useDoctorNotification";
import { NotificationListener } from "@/components/NotificationListener";

Chart.register(CategoryScale);

export default function DoctorDashboardPage() {
  const { user } = AppState();

  const getStatusCounts = (appointments) => {
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      canceled: 0,
    };

    appointments.forEach((appt) => {
      const status = appt.status?.toLowerCase();
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  };

  const [docAppointments, setDocAppointments] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, isError, isFetching } = useDoctorAppointments(
    page,
    limit
  );

  const { mutateAsync: updateAppointment } = useUpdateDoctorAppointment();
  const { mutateAsync: notificationRequest } =
    useDoctorNotificationPermission();

  useEffect(() => {
    // If no user, do nothing.
    if (!user) return;

    // If permission exist in backend, skip.
    if (user.notificationPermission) return;

    // Only prompt the browser if it hasn't been granted/denied yet.
    if (Notification.permission === "default") {
      Notification.requestPermission().then(async (result) => {
        const granted = result === "granted";
        try {
          // persist granted result.
          await notificationRequest({ granted });
          user.notificationPermission = granted;
        } catch (err) {
          console.error("Failed to save notification permission:", err);
        }
      });
    } else {
      // Browser already has a verdict (granted/denied) but backend hasn't recorded it:
      const granted = Notification.permission === "granted";
      requestPermission({ granted }).catch((err) =>
        console.error("Failed to sync existing permission:", err)
      );
    }
  }, [user, notificationRequest]);

  useEffect(() => {
    if (data?.appointments) {
      const statusCounts = getStatusCounts(data?.appointments);
      const chartData = {
        labels: ["Pending", "Confirmed", "Completed", "Canceled"],
        datasets: [
          {
            label: "Appointments",
            data: [
              statusCounts.pending,
              statusCounts.confirmed,
              statusCounts.completed,
              statusCounts.canceled,
            ],
            backgroundColor: ["#facc15", "#22c55e", "#3b82f6", "#ef4444"],
            borderRadius: 4,
          },
        ],
      };

      setDocAppointments(chartData);
    }
  }, [data]);

  if (isLoading || !user) return <p>Loading appointments</p>;
  if (isError) return <p>{error.message}</p>;

  const isFirstPage = page === 1;
  const isLastPage = page === data.totalPages;

  const appointmentActions = (appointment) => {
    switch (appointment.status) {
      case "pending":
        return [
          {
            id: appointment._id,
            type: "button",
            label: "Confirm",
            actionKey: "confirm",
          },
          {
            id: appointment._id,
            type: "button",
            label: "Cancel",
            actionKey: "cancel",
          },
          {
            id: appointment._id,
            type: "link",
            label: "View",
            link: `/doctor/dashboard/appointments/${appointment._id}`,
          },
        ];
      case "confirmed":
        return [
          {
            id: appointment._id,
            type: "button",
            label: "Complete",
            actionKey: "complete",
          },
          {
            id: appointment._id,
            type: "button",
            label: "Cancel",
            actionKey: "cancel",
          },
          {
            id: appointment._id,
            type: "link",
            label: "View",
            link: `/doctor/dashboard/appointments/${appointment._id}`,
          },
        ];
      case "completed":
      case "canceled":
        return [
          {
            id: appointment._id,
            type: "link",
            label: "View",
            link: `/doctor/dashboard/appointments/${appointment._id}`,
          },
        ];
      default:
        return [];
    }
  };

  const confirmHandler = async (id) => {
    try {
      console.log("Performing [confirm] action");
      await updateAppointment({
        id,
        status: "confirmed",
      });
      console.log("appointment status updated...[confirmed]");
    } catch (error) {
      console.error("error updating appointment to confirmed: ", error);
    }
  };

  const completedHandler = async (id) => {
    try {
      console.log("Performing [complete] action");
      await updateAppointment({
        id,
        status: "completed",
      });
      console.log("appointment status updated...[completed]");
    } catch (error) {
      console.error("error updating appointment to completed: ", error);
    }
  };

  const cancelHandler = async (id) => {
    try {
      console.log("Performing [cancel] action");
      await updateAppointment({
        id,
        status: "canceled",
      });
      console.log("appointment status updated...[canceled]");
    } catch (error) {
      console.error("error updating appointment canceled: ", error);
    }
  };

  const statusColors = {
    pending: "#facc15", // yellow
    confirmed: "#22c55e", // green
    completed: "#3b82f6", // blue
    canceled: "#ef4444", // red
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1>Welcome to CareConnect</h1>
          <p>CareConnect {user?.role} dashboard</p>
        </div>

        <div>
          <UserCard name={user?.name} role={user?.role} />
        </div>
      </div>

      {docAppointments?.datasets?.[0]?.data?.every((count) => count === 0) ? (
        <p className="mt-10 text-center text-gray-500">
          No appointment data to display in charts.
        </p>
      ) : (
        <>
          <DoughnutChart
            chartData={docAppointments}
            text="Appointment Status Breakdown"
          />
          <div className="my-6" />
          <BarChart
            chartData={docAppointments}
            text="Appointment Status Breakdown"
          />
        </>
      )}

      <div className="mt-20">
        {data?.appointments?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No appointments found at the moment.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-200">
                <th className="py-4 px-6">S/N</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Reason</th>
                <th className="py-4 px-6">Note</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((appointment, index) => (
                <tr
                  key={appointment._id}
                  className="bg-gray-100"
                  style={{
                    backgroundColor:
                      statusColors[appointment.status?.toLowerCase()] ||
                      "#f1f5f9",
                  }}
                >
                  <td className="py-4 px-6 truncate max-w-[150px]">
                    {index + 1}
                  </td>
                  <td
                    className="py-4 px-6 truncate max-w-[150px]"
                    title={appointment.patientId.name}
                  >
                    {appointment.patientId.name}
                  </td>
                  <td className="py-4 px-6">{appointment.patientId.email}</td>
                  <td className="py-4 px-6">{appointment.reason}</td>
                  <td
                    className="py-4 px-6 truncate max-w-[150px]"
                    title={appointment.notes}
                  >
                    {appointment.notes}
                  </td>
                  <td className="py-4 px-6">{appointment.status}</td>
                  <td className="py-4 px-6">
                    <Dropdown
                      actions={appointmentActions(appointment)}
                      actionHandler={(action) => {
                        console.log("Clicked action:", action.id, action.actionKey);
                        if (action.actionKey === "confirm") {
                          confirmHandler(appointment._id);
                        } else if (action.actionKey === "complete") {
                          completedHandler(appointment._id);
                        } else if (action.actionKey === "cancel") {
                          cancelHandler(appointment._id);
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} className="py-6 px-6 text-right">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={isFirstPage}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="mx-4">
                    {data?.currentPage} of {data?.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => (p < data?.totalPages ? p + 1 : p))
                    }
                    disabled={isLastPage}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                  {isFetching && <span className="ml-4">Loading...</span>}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
