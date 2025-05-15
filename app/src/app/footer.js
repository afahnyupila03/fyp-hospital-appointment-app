import { HeartIcon } from "@heroicons/react/24/outline";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex justify-center w-full max-w-md p-4  rounded-lg shadow-sm">
        <p className="flex gap-1">
          <span className="text-gray-300">
            {year} &copy; CareConnect - Designed by
          </span>
          <span>
            <HeartIcon className="h-6 w-6 text-gray-500" />
          </span>
          <span>Dashboard</span>
        </p>
      </div>
    </div>
  );
};
