export const UserCard = ({ name, role }) => {
  return (
    <div>
      <div className="rounded-md border-2 border-gray-100 shadow-lg">
        <h3 className="uppercase mx-10 mt-4">{name}</h3>
        <p className="uppercase text-gray-500 mb-4 mx-10">{role}</p>
      </div>
    </div>
  );
};
