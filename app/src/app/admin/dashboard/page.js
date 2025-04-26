"use client";

// import { getDoctors } from "@/admin/service";
import useProtectedRoute from "@/app/useProtectedRoute";
import { UserCard } from "@/components/UserCard";
import { AppState } from "@/store/context";
import { AdminMainMenu } from "@/utils/adminNav";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { CategoryScale } from "chart.js";
import Link from "next/link";
import { useEffect, useState } from "react";

import Chart from "chart.js/auto";
import PieChart from "@/components/Chart";

import { getDoctorsService } from "@/api/admin/doctorManagementService";
import Dropdown from "@/components/Dropdown";
import {
  useArchiveDoctor,
  useArchivePatient,
  useDoctorsData,
  usePatientsData,
  useUnarchiveDoctor,
  useUnarchivePatient,
} from "@/hooks/useAdmin";

Chart.register(CategoryScale);

const dropdownActions = (patient) => [
  {
    id: patient._id,
    type: "link",
    label: "View",
    link: `/admin/dashboard/patients/${patient._id}`,
  },
  {
    id: patient._id,
    type: "button",
    label: patient.isActive ? "Archive" : "Unarchive",
  },
];

const doctorDropdownActions = (doctor) => [
  {
    id: doctor._id,
    type: "link",
    label: "View",
    link: `/admin/dashboard/doctors/${doctor._id}`,
  },
  {
    id: doctor._id,
    type: "button",
    label: doctor.isActive ? "Archive" : "Unarchive",
  },
];

export default function AdminDashboard() {
  useProtectedRoute();
  const { user } = AppState();
  console.log("authenticated user data: ", user);

  const [chartData, setChartData] = useState(null);
  const [doctorChart, setDoctorChart] = useState(null);

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isRefetching,
    isLoadingError,
  } = usePatientsData();

  const {
    data: doctorsData,
    isLoading: loadingDoctors,
    error: doctorsError,
    refetch: refetchDoctor,
  } = useDoctorsData();

  const { mutateAsync: archivePatient } = useArchivePatient();
  const { mutateAsync: archiveDoctor } = useArchiveDoctor();
  const { mutateAsync: unarchiveDoctor } = useUnarchiveDoctor();
  const { mutateAsync: unarchivePatient } = useUnarchivePatient();

  useEffect(() => {
    if (data) {
      const { patients } = data;
      const patientsPerMonth = patients.reduce((acc, patient) => {
        const month = dayjs(patient.createdAt).format("MM YYY");
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      // prepare chart data
      const labels = Object.keys(patientsPerMonth);
      const counts = Object.keys(patientsPerMonth);

      setChartData({
        labels, // x-axis
        datasets: [
          {
            label: "Patients",
            data: counts, // y-axis
            backgroundColor: [
              "rgba(75,192,192,1)",
              "&quot;#ecf0f1",
              "#50AF95",
              "#f3ba2f",
              "#2a71d0",
            ],
            borderColor: "black",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [data]);

  useEffect(() => {
    if (doctorsData) {
      console.log("doctorsData: ", doctorsData);
      // const { doctors } = doctorsData;
      // console.log('useEffect doctors: ', doctors)
      const doctorsPerMonth = doctorsData.reduce((acc, doctor) => {
        const month = dayjs(doctor.createdAt).format("MM YYY");
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(doctorsPerMonth);
      const counts = Object.keys(doctorsPerMonth);

      setDoctorChart({
        labels,
        datasets: [
          {
            label: "Doctors",
            data: counts,
            backgroundColor: [
              "rgba(75,192,192,1)",
              "&quot;#ecf0f1",
              "#50AF95",
              "#f3ba2f",
              "#2a71d0",
            ],
            borderColor: "black",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [doctorsData]);

  if (isLoading && loadingDoctors) return <p>Loading...</p>;

  // Utility: check if chartData has any non-zero values
  const hasChartData = chartData?.datasets?.[0]?.data?.some((val) => val > 0);
  const hasDoctorData = doctorChart?.datasets[0]?.doctorsData?.some(
    (val) => val > 0
  );

  const archivePatientHandler = async (id) => {
    try {
      await archivePatient({
        id,
        isActive: false,
      });
      console.log("success archiving patient");
      await refetch();
    } catch (error) {
      console.error("error archiving patient: ", error.message);
      throw error;
    }
  };
  const archiveDoctorHandler = async (id) => {
    try {
      await archiveDoctor({
        id,
        isActive: false,
      });

      await refetchDoctor();
    } catch (error) {
      console.error("Error archiving doctor profile: ", error);
      throw error;
    }
  };

  const unarchiveDoctorHandler = async (id) => {
    try {
      await unarchiveDoctor({
        id,
        isActive: true,
      });

      await refetchDoctor();
    } catch (error) {
      console.error("error unarchiving doctor: ", error);
      throw error;
    }
  };
  const unarchivePatientHandler = async (id) => {
    try {
      await unarchivePatient({
        id,
        isActive: true,
      });

      await refetch();
    } catch (error) {
      console.error("error unarchiving patient: ", error);
      throw error;
    }
  };

  return (
    <div className="px-10 mx-10 py-10">
      <div className="flex justify-between items-center">
        <div>
          <h1>Welcome to CareConnect</h1>
          <p>CareConnect {user?.role} dashboard</p>
        </div>

        <div>
          <UserCard name={user?.name} role={user?.role} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
        {/* Patients Chart */}
        <div>
          {chartData ? (
            hasChartData ? (
              <PieChart text="Patients data" chartData={chartData} />
            ) : (
              <>
                <p className="text-center text-gray-500">
                  No chart data to display
                </p>
                <PieChart
                  text="Patients data"
                  chartData={{
                    labels: ["No Data"],
                    datasets: [
                      {
                        label: "No Data",
                        data: [1],
                        backgroundColor: ["#547792"],
                        borderWidth: 0,
                      },
                    ],
                  }}
                />
              </>
            )
          ) : (
            <p>Loading patients chart...</p>
          )}
        </div>

        {/* Doctors Chart */}
        <div>
          {doctorChart ? (
            hasDoctorData ? (
              <PieChart text="Doctors data" chartData={doctorChart} />
            ) : (
              <>
                <p className="text-center text-gray-500">
                  No chart data to display
                </p>
                <PieChart
                  text="Doctors data"
                  chartData={{
                    labels: ["No Data"],
                    datasets: [
                      {
                        label: "No Data",
                        data: [1],
                        backgroundColor: ["#213448"],
                        borderWidth: 0,
                      },
                    ],
                  }}
                />
              </>
            )
          ) : (
            <p>Loading doctors chart...</p>
          )}
        </div>

        {/* Tables Section */}
        {/* Patients Table */}
        <div>
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-300">
              <tr>
                <th className="border px-4 py-2">S/N</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {data?.patients?.map((patient, index) => (
                <tr key={patient._id}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{patient.name}</td>
                  <td className="border px-4 py-2">{patient.email}</td>
                  <td>
                    <Dropdown
                      actions={dropdownActions(patient)}
                      actionHandler={(actionLabel) =>
                        actionLabel === "Archive"
                          ? archivePatientHandler(patient._id)
                          : unarchivePatientHandler(patient._id)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctors Table */}
        <div>
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-gray-300">
              <tr>
                <th className="border px-4 py-2">S/N</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Specialty</th>
                <th className="border px-4 py-2">Department</th>
              </tr>
            </thead>
            <tbody>
              {doctorsData?.map((doctor, index) => (
                <tr key={doctor._id}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{doctor.name}</td>
                  <td className="border px-4 py-2">{doctor.email}</td>
                  <td className="border px-4 py-2">{doctor.specialization}</td>
                  <td className="border px-4 py-2">{doctor.department}</td>
                  <td>
                    <Dropdown
                      actions={doctorDropdownActions(doctor)}
                      actionHandler={(actionLabel) =>
                        actionLabel === "Archive"
                          ? archiveDoctorHandler(doctor._id)
                          : unarchiveDoctorHandler(doctor._id)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
