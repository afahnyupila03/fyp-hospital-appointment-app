'use client'
import React, { useState } from 'react'
import { Form, Formik } from 'formik'
import { AppState } from '@/store/context'
import { useRouter } from 'next/navigation'
import CustomInput from '@/components/CustomInput'
import { signinSchema, signupSchema } from '@/schema/schema'

export default function AdminAuth () {
  const { signupHandler, signinHandler } = AppState()
  const [existingUser, setExistingUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleExistingUser = () => {
    setTimeout(() => {
      setExistingUser(prev => !prev)
    }, 500)
  }

  const handleSignup = async (values, actions) => {
    try {
      const role = 'admin'
      const email = values.email.trim()
      const password = values.password
      const name = values.name.trim()

      if (!name || name.length < 6)
        throw new Error('Name must be at least 6 characters')
      if (!email) throw new Error('Email is required')
      if (!password || password.length < 6)
        throw new Error('Password must be at least 6 characters')

      await signupHandler(values, role)
      actions.resetForm()
    } catch (error) {
      console.error('SIGNED_UP_USER_ERROR: ', error.message)
      actions.setSubmitting(false)
    }
  }

  const handleSignin = async (values, actions) => {
    try {
      const role = 'admin'
      const { email, password } = values
      if (!email || !password)
        throw new Error('Email and password are required')

      await signinHandler(email, password, role)
      actions.resetForm()
    } catch (error) {
      console.error('SIGNED_IN_USER_ERROR: ', error.message)
      actions.setSubmitting(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 px-4'>
      <div className='w-full max-w-md bg-white p-8 rounded-xl shadow-md'>
        <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
          {existingUser ? 'Create Admin Account' : 'Admin Log In'}
        </h2>

        <Formik
          initialValues={{ email: '', name: '', password: '' }}
          validationSchema={existingUser ? signupSchema : signinSchema}
          onSubmit={existingUser ? handleSignup : handleSignin}
        >
          {({
            values,
            handleChange,
            handleBlur,
            isSubmitting,
            errors,
            touched
          }) => (
            <Form className='space-y-5'>
              {existingUser && (
                <CustomInput
                  onChange={handleChange}
                  id='name'
                  name='name'
                  type='text'
                  onBlur={handleBlur}
                  value={values.name}
                  placeholder='Enter full name'
                  label='Name'
                  touched={touched}
                  errors={errors}
                />
              )}

              <CustomInput
                onChange={handleChange}
                id='email'
                name='email'
                type='email'
                onBlur={handleBlur}
                value={values.email}
                placeholder='Enter email address'
                label='Email'
                touched={touched}
                errors={errors}
              />

              <CustomInput
                onChange={handleChange}
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                onBlur={handleBlur}
                value={values.password}
                placeholder='Enter password'
                label='Password'
                errors={errors}
                touched={touched}
                togglePassword={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
              />

              <div className='text-sm text-center text-gray-600'>
                {existingUser ? 'Already have an account?' : 'New user?'}{' '}
                <button
                  type='button'
                  className='text-blue-600 hover:underline ml-1'
                  onClick={handleExistingUser}
                >
                  {existingUser ? 'Log in' : 'Create account'}
                </button>
              </div>

              <button
                className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all duration-200'
                type='submit'
                disabled={isSubmitting}
              >
                {existingUser ? 'Sign Up' : 'Log In'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
