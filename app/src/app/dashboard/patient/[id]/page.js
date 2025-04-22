import { PatientId } from "./PatientId";

export default async function PatientIdPage({ params }) {
  const { id } = await params;
  return <PatientId id={id} />;
}
