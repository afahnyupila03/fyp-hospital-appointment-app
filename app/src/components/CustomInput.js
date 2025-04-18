import { Field } from "formik";
import React from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function CustomInput({
  id,
  name,
  label,
  type,
  onChange,
  onBlur,
  placeholder,
  value,
  as,
  children,
  row,
  togglePassword,
  showPassword,
  errors = {},
  touched = {},
}) {
  const inputProps = {
    id,
    name,
    onChange,
    onBlur,
    value,
    className:
      "block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6",
    autoComplete: "off",
    placeholder,
    errors,
    touched,
  };

  return (
    <div className="sm:col-span-4 relative">
      <label
        htmlFor={id}
        className="block text-lg font-medium leading-6 text-gray-800"
      >
        {label}
      </label>
      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-800 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md relative">
          {as === "select" ? (
            <Field as="select" {...inputProps}>
              {children}
            </Field>
          ) : as === "textarea" ? (
            <Field as="textarea" {...inputProps} rows={row || 3} />
          ) : (
            <Field type={type} {...inputProps} />
          )}
          {name === "password" && value && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-lg leading-5"
            >
              {/* login */}
              {showPassword ? (
                <EyeSlashIcon
                  onClick={togglePassword}
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              ) : (
                <EyeIcon
                  onClick={togglePassword}
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              )}
            </button>
          )}
        </div>
        {errors[name] && touched[name] && (
          <p className="text-red-500">{errors[name]}</p>
        )}
      </div>
    </div>
  );
}
