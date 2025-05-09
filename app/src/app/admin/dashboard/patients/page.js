"use client";

import {
  useArchivePatient,
  usePatientsData,
  useUnarchivePatient,
} from "@/hooks/admin/useAdmin";
import Link from "next/link";

export default function PatientsHomePage() {
  const { data, isLoading, isError, error, refetch } = usePatientsData();

  const { mutateAsync: archivePatient } = useArchivePatient();
  const { mutateAsync: unarchivePatient } = useUnarchivePatient();

  const archivePatientHandler = async (id) => {
    try {
      await archivePatient({ id, isActive: false });
      window.location.reload();
    } catch (error) {
      console.error("error archiving patient: ", error);
      throw error;
    }
  };

  const unarchivePatientHandler = async (id) => {
    try {
      await unarchivePatient({ id, isActive: true });
      window.location.reload();
    } catch (error) {
      console.error("error un-archiving patient: ", error);
      throw error;
    }
  };

  if (isLoading) return <p>Loading patients data</p>;
  if (isError) return <p>Error loading patients, {error.message}</p>;

  return (
    <div>
      {data?.patients?.map((patients) => (
        <div key={patients._id}>
          <p>Name: {patients.name}</p>
          <p>Email: {patients.email}</p>
          <p>Booked appointments: ({patients?.appointments.length})</p>
          <Link href={`/admin/dashboard/patients/${patients._id}`}>
            View Profile
          </Link>
          <button
            type="button"
            onClick={
              patients.isActive === true
                ? () => archivePatientHandler(patients._id)
                : () => unarchivePatientHandler(patients._id)
            }
          >
            {patients.isActive === true ? "Archive" : "Unarchive"}
          </button>
        </div>
      ))}
    </div>
  );
}
