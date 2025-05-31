import { Field } from 'formik'
import React from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function CustomInput ({
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
  touched = {}
}) {
  const inputProps = {
    id,
    name,
    onChange,
    onBlur,
    value,
    placeholder,
    autoComplete: 'off',
    className:
      'w-full border-none bg-transparent py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0'
  }

  const hasError = errors[name] && touched[name]

  return (
    <div className='sm:col-span-4 mb-4'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label}
      </label>

      <div
        className={`flex items-center rounded-md border ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-600 relative`}
      >
        {as === 'select' ? (
          <Field
            as='select'
            {...inputProps}
            className={`${inputProps.className} pr-10`}
          >
            {children}
          </Field>
        ) : as === 'textarea' ? (
          <Field
            as='textarea'
            {...inputProps}
            rows={row || 3}
            className={`${inputProps.className} resize-none`}
          />
        ) : (
          <Field
            type={type === 'password' && showPassword ? 'text' : type}
            {...inputProps}
            className={`${inputProps.className} pr-10`}
          />
        )}

        {name === 'password' && value && (
          <button
            type='button'
            onClick={togglePassword}
            className='absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none'
          >
            {showPassword ? (
              <EyeSlashIcon className='h-5 w-5' />
            ) : (
              <EyeIcon className='h-5 w-5' />
            )}
          </button>
        )}
      </div>

      {hasError && <p className='mt-1 text-sm text-red-600'>{errors[name]}</p>}
    </div>
  )
}
