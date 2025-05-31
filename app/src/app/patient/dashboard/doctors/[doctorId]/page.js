import DoctorId from './DoctorId'

export default async function DoctorPage ({ params }) {
  const { doctorId } = params

  return (
    <div className='p-6 min-h-screen bg-gray-50'>
      <div className='mb-6 text-lg font-semibold text-gray-700'>
        Doctor ID: <span className='text-blue-600'>{doctorId}</span>
      </div>

      <div>
        <DoctorId id={doctorId} />
      </div>
    </div>
  )
}
