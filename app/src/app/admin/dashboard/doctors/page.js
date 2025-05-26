"use client";

import { useDoctorsData } from "@/hooks/admin/useAdmin";
import Link from "next/link";

export default function DoctorsHomePage() {
  const { data, isLoading, isError, error } = useDoctorsData();

  if (isLoading) return <p>Loading doctor profiles</p>;
  if (isError) return <p>Error loading doctor profiles, {error.message}</p>;

  return (
    <div>
      <p>Doctors</p>

      {data?.map((doctor) => {
        const {
          _id,
          name,
          email,
          specialization,
          department,
          schedules = [],
          appointments = [],
          createdBy,
          createdAt,
          isActive,
          terminatedAt,
          updatedAt,
        } = doctor;

        return (
          <div key={_id}>
            <p>Name: {name}</p>
            <p>Email: {email}</p>
            <p>Specialty: {specialization}</p>
            <p>Department: {department}</p>

            {schedules.length > 0 ? (
              <div>
                <p>Schedules:</p>
                {schedules.map(({ _id, day, time }) => (
                  <p key={_id}>
                    {day} / {time}
                  </p>
                ))}
              </div>
            ) : (
              <p>No schedules assigned</p>
            )}

            <p>Appointments: ({appointments.length})</p>

            <p>Account status: {isActive.toString()}</p>

            <p>
              {isActive.toString() === "true"
                ? ""
                : `Terminated on : ${new Date(
                    terminatedAt
                  ).toLocaleDateString()}`}
            </p>

            <p>
              {new Date(createdAt).toLocaleDateString() ===
              new Date(updatedAt).toLocaleDateString()
                ? ""
                : `Account updated on: ${new Date(
                    updatedAt
                  ).toLocaleDateString()}`}
            </p>

            <div>
              <p>
                Created by: {createdBy?.name} ({createdBy?.role})
              </p>
              <p>
                Account created on: {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>

            <Link href={`doctors/${_id}`}>View Profile</Link>
          </div>
        );
      })}
    </div>
  );
}
