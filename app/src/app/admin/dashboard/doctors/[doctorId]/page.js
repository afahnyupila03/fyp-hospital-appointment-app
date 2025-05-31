import { DoctorId } from "./DoctorId";

export default async function DoctorPage({ params }) {
  const { doctorId } = await params;

  return <DoctorId id={doctorId} />;
}
