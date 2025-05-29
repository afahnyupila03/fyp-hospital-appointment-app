export const UserCard = ({ name, role }) => {
  return (
    <div className='w-full max-w-sm mx-auto'>
      <div className='rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow bg-white px-6 py-4'>
        <h3 className='text-lg font-semibold uppercase text-gray-800'>
          {name}
        </h3>
        <p className='text-sm uppercase text-gray-500 mt-1'>{role}</p>
      </div>
    </div>
  )
}
