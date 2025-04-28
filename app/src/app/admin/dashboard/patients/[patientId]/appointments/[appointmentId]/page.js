"use client";

import { use } from "react";
import { Appointment } from "./Appointment";

export default function AppointmentIdPage({ params }) {
  const { appointmentId } = use(params);

  return <Appointment id={appointmentId} />;
}
