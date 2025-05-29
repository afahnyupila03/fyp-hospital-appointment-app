'use client'

import CustomInput from '@/components/CustomInput'
import { signinSchema } from '@/schema/schema'
import { AppState } from '@/store/context'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DoctorAuthPage () {
  const { signinHandler } = AppState()
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const router = useRouter()

  const showPasswordHandler = () => setShowPassword(!showPassword)

  const loginDoctorHandler = async (values, actions) => {
    try {
      const role = 'doctor'
      const email = values.email.trim()
      const password = values.password

      await signinHandler(email, password, role)
      console.log('Doctor login success')
      actions.resetForm()
    } catch (error) {
      console.error('Error logging in doctor: ', error.message || error)
      setErrorMsg(error.message || 'Login failed')
      actions.setSubmitting(false)
    }
  }

  return (
    <div className='max-w-md mx-auto mt-10 bg-white p-6 rounded shadow'>
      <h2 className='text-2xl font-semibold mb-6 text-center'>Doctor Login</h2>

      {errorMsg && (
        <p className='text-red-500 text-sm mb-4 text-center'>{errorMsg}</p>
      )}

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={signinSchema}
        onSubmit={loginDoctorHandler}
      >
        {({
          values,
          handleBlur,
          handleChange,
          isSubmitting,
          errors,
          touched
        }) => (
          <Form className='space-y-4'>
            <CustomInput
              name='email'
              placeholder='Email'
              label='Email'
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              id='email'
              type='email'
              errors={errors}
              touched={touched}
            />
            <CustomInput
              name='password'
              placeholder='Password'
              label='Password'
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              id='password'
              showPassword={showPassword}
              togglePassword={showPasswordHandler}
              type={showPassword ? 'text' : 'password'}
              errors={errors}
              touched={touched}
            />

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50'
              aria-label='Login'
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
