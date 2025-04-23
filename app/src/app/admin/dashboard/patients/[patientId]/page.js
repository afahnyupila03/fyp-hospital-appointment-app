import {PatientId} from '@/app/admin/dashboard/patients/[patientId]/PatientId'

export default async function PatientIdPageNew({ params }) {
  const { patientId } = await params;

  return <PatientId id={patientId} />;
}
