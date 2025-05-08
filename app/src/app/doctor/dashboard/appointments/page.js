"use client";
import Dropdown from "@/components/Dropdown";
import { useDoctorAppointments } from "@/hooks/useDoctor";
import React, { useState } from "react";

function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isFetching, isError, error } = useDoctorAppointments(
    page,
    limit
  );

  if (isLoading || isFetching) return <p>Loading appointments</p>;
  if (isError) return <p>{error}</p>;

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
          },
          {
            id: appointment._id,
            type: "button",
            label: "Cancel",
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
          },
          {
            id: appointment._id,
            type: "button",
            label: "Cancel",
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
      await updateAppointment({
        id,
        status: "canceled",
      });
      console.log("appointment status updated...[canceled]");
    } catch (error) {
      console.error("error updating appointment canceled: ", error);
    }
  };

  return (
    <div>
      <table className="w-full border-collapse mt-20">
        <thead>
          <tr className="text-left bg-gray-200">
            <th className="py-4 px-6" style={{ width: "2%" }}>
              S/N
            </th>
            <th className="py-4 px-6" style={{ width: "12%" }}>
              Name
            </th>
            <th className="py-4 px-6" style={{ width: "12%" }}>
              Email
            </th>
            <th className="py-4 px-6" style={{ width: "6%" }}>
              Reason
            </th>
            <th className="py-4 px-6" style={{ width: "15%" }}>
              Note
            </th>
            <th className="py-4 px-6" style={{ width: "4%" }}>
              Status
            </th>
            <th className="py-4 px-6" style={{ width: "1%" }}>
              {/* actions tab. */}
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.appointments?.map((appointment, index) => (
            <tr
              key={appointment._id}
              className="bg-gray-100"
              // style={{
              //   backgroundColor:
              //     statusColors[appointment.status?.toLowerCase()] || "#f1f5f9",
              // }}
            >
              <td className="py-4 px-6 truncate max-w-[150px]">{index + 1}</td>
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
              <td className="py-4 px-6" title="appointment actions">
                <Dropdown
                  actions={appointmentActions(appointment)}
                  actionHandler={(actionLabel) => {
                    if (actionLabel === "confirm") {
                      confirmHandler(appointment._id);
                    } else if (actionLabel === "complete") {
                      completedHandler(appointment._id);
                    } else {
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
    </div>
  );
}

export default AppointmentsPage;
