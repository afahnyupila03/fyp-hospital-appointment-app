"use client";

import { useState } from "react";
import { Dialog, DialogPanel, PopoverGroup } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AppState } from "@/store/context";
import Link from "next/link";

const userLinks = (user) => {
  if (user) {
    if (user.role === "admin") {
      return [
        {
          name: "Create Doctor",
          href: "/admin/dashboard/doctors/create-doctor",
        },
        {
          name: "Doctors",
          href: "/admin/dashboard/doctors",
        },
        {
          name: "Patients",
          href: "/admin/dashboard/patients",
        },
      ];
    } else if (user.role === "doctor") {
      return [
        {
          name: "Appointments",
          href: "dashboard/appointments",
        },
      ];
    } else if (user.role === "patient") {
      return [{}];
    }
  }
};

export const Header = () => {
  const { user, loading } = AppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <div>Loading.....</div>;

  const redirectByUserRole = (role) => {
    let url;
    switch (role) {
      case "admin":
        url = "/admin/dashboard";
        break;
      case "doctor":
        url = "/doctor/dashboard";
        break;
      case "patient":
        url = "/patient/dashboard";
        break;
      default:
        url = undefined;
        break;
    }

    return url;
  };

  const links = userLinks(user);

  return (
    <header className="bg-white">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          {user ? (
            <Link href={redirectByUserRole(user.role)} className="-m-1.5 p-1.5">
              <span className="sr-only">CareConnect</span>
              <img alt="" src="../favicon.ico" className="h-8 w-auto" />
            </Link>
          ) : (
            <button
              disabled
              className="cursor-not-allowed opacity-50 -m-1.5 p-1.5"
              aria-disabled="true"
            >
              <span className="sr-only">CareConnect</span>
              <img alt="" src="../favicon.ico" className="h-8 w-auto" />
            </button>
          )}
        </div>
        {/* Button */}
        {user && (
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
        )}

        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          {user &&
            links.map((link, index) => (
              <Link href={link.href} key={index}>
                {link.name}
              </Link>
            ))}
        </PopoverGroup>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user && <button type="button">Logout</button>}
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            {user ? (
              <Link
                href={redirectByUserRole(user.role)}
                className="-m-1.5 p-1.5"
              >
                <span className="sr-only">CareConnect</span>
                <img alt="" src="../favicon.ico" className="h-8 w-auto" />
              </Link>
            ) : (
              <button
                disabled
                className="cursor-not-allowed opacity-50 -m-1.5 p-1.5"
                aria-disabled="true"
              >
                <span className="sr-only">CareConnect</span>
                <img alt="" src="../favicon.ico" className="h-8 w-auto" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {user &&
                  links.map((link, index) => (
                    <Link href={link.href} key={index}>
                      {link.name}
                    </Link>
                  ))}
              </div>
              <div className="py-6">
                {user && <button type="button">Logout</button>}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};
