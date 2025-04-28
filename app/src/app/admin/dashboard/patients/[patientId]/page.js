"use client";

import { PatientId } from "@/app/admin/dashboard/patients/[patientId]/PatientId";
import { use } from "react";

export default function PatientIdPageNew({ params }) {
  const { patientId } = use(params);

  return <PatientId id={patientId} />;
}
