export default async function BookDoctorPage ({ params }) {
  const { doctorId } = await params

  return <p>book appointment for doctor with id: {doctorId}</p>
}
