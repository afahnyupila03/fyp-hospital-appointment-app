'use client'

import CustomInput from '@/components/CustomInput'
import { signinSchema, signupSchema } from '@/schema/schema'
import { AppState } from '@/store/context'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PatientAuthPage () {
  const { signinHandler, signupHandler } = AppState()
  const [showPassword, setShowPassword] = useState(false)
  const [existingUser, setExistingUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const showPasswordHandler = () => setShowPassword(!showPassword)

  const existingUserHandler = (resetForm) => {
    setExistingUser(prev => !prev)
    setTimeout(() => {
      resetForm()  // clear touched and errors
    }, 100)        // slight delay to avoid triggering validation
  }

  const signupPatientHandler = async (values, actions) => {
    const role = 'patient'
    try {
      setLoading(true)
      const name = values.name.trim()
      const email = values.email.trim()
      const password = values.password

      if (!name) throw new Error('Please enter your name')
      if (name.length < 6) throw new Error('Name must be at least 6 characters long')
      if (!email) throw new Error('Please input your email')
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters')

      await signupHandler(name, email, password, role)

      actions.resetForm()
    } catch (error) {
      console.error('patient signup error:', error)
      actions.setSubmitting(false)
    } finally {
      setLoading(false)
    }
  }

  const loginPatientHandler = async (values, actions) => {
    const role = 'patient'
    try {
      setLoading(true)
      const email = values.email.trim()
      const password = values.password

      if (!email) throw new Error('Email is required')
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters')

      await signinHandler(email, password, role)

      actions.resetForm()
    } catch (error) {
      console.error('patient login error:', error)
      actions.setSubmitting(false)
    } finally {
      setLoading(false)
    }
  }

  const initialValues = { name: '', email: '', password: '' }

  return (
    <div className="max-w-md mx-auto mt-10 px-6 py-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {existingUser ? 'Sign Up' : 'Log In'}
      </h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={existingUser ? signupSchema : signinSchema}
        onSubmit={existingUser ? signupPatientHandler : loginPatientHandler}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          isSubmitting,
          isValid,
          resetForm
        }) => (
          <Form className="space-y-4">
            {existingUser && (
              <CustomInput
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                label="Name"
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
                value={values.name}
              />
            )}

            <CustomInput
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              label="Email"
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              value={values.email}
            />

            <CustomInput
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Password"
              label="Password"
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              value={values.password}
              showPassword={showPassword}
              togglePassword={showPasswordHandler}
            />

            <div className="flex justify-between items-center text-sm">
              <span>
                {existingUser ? 'Already have an account?' : 'New user?'}
              </span>
              <button
                type="button"
                onClick={() => existingUserHandler(resetForm)}
                className="text-blue-600 hover:underline"
              >
                {existingUser ? 'Login' : 'Signup'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
              disabled={isSubmitting || !isValid}
            >
              {loading ? 'Please wait...' : existingUser ? 'Signup' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
