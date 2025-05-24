import DoctorId from './DoctorId'

export default async function DoctorPage ({ params }) {
  const { doctorId } = await params

  return (
    <div>
      <div>Doctor is server page: {doctorId}</div>
      <DoctorId id={doctorId} />
    </div>
  )
}
