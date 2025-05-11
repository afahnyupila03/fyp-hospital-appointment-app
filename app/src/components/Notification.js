import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/20/solid";
import dayjs from "dayjs";
import Link from "next/link";

const styles = {
  notificationWrapper: {
    position: "relative",
    display: "inline-block",
  },
  notificationCounter: {
    position: "absolute",
    top: "-8px",
    right: "-6px",
    color: "white",
    backgroundColor: "#1f2937", // same as Tailwind bg-gray-900
    borderRadius: "9999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 10,
    minWidth: "20px",
    textAlign: "center",
    lineHeight: "1",
  },
};

export default function Notification({
  notificationCounter,
  notifications,
  notificationHandler,
}) {
  const messageDate = (createdAt) => {
    if (!createdAt) {
      return "No date";
    }

    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now - created) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div style={styles.notificationWrapper}>
        <MenuButton className="inline-flex justify-center items-center">
          <BellIcon aria-hidden="true" className="size-9 text-gray-400" />
        </MenuButton>
        {notificationCounter > 0 && (
          <div style={styles.notificationCounter}>{notificationCounter}</div>
        )}
      </div>

      <MenuItems
        transition
        className="absolute -right-24 
        z-10 mt-2 w-56 origin-top-right 
        rounded-md bg-white shadow-lg 
        ring-1 ring-black/5 transition 
        focus:outline-hidden 
        data-closed:scale-95 
        data-closed:transform 
        data-closed:opacity-0 
        data-enter:duration-100 
        data-enter:ease-out 
        data-leave:duration-75 
        data-leave:ease-in"
      >
        <div className="py-1">
          {notifications?.slice(0, 5).map((notification) => (
            <MenuItem key={notification._id}>
              <div className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden">
                <div>
                  <p>{notification.type}</p>
                  <p>{messageDate(notification.createdAt)}</p>
                </div>
                <div className="flex py-1 justify-between items-center">
                  {notification.status === "unread" ? (
                    <button className="cursor-pointer"
                      onClick={() => notificationHandler(notification._id)}
                    >
                      Mark as read
                    </button>
                  ) : (
                    <div className="w-[90px]"></div> // maintain space
                  )}
                  <Link
                    href={`doctor/dashboard/notifications/${notification._id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            </MenuItem>
          ))}
        </div>

        <div className="py-1 px-10">
          <p className="pb-2 text-right text-grey-200">See all</p>
        </div>
      </MenuItems>
    </Menu>
  );
}
