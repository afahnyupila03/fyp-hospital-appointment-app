import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";

export default function Dropdown({ actions, actionHandler }) {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-center gap-x-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
              />
            </svg>
          </MenuButton>
        </div>
  
        <MenuItems className="absolute right-0 z-10 mt-2 w-20 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          {actions.map((action, index) => (
            <MenuItem key={index}>
              {({ active }) =>
                action.type === "link" ? (
                  <Link
                    href={action.link}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    {action.label} 
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => actionHandler(action)}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    {action.label}
                  </button>
                )
              }
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    );
  }
  