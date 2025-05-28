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
  const existingUserHandler = () => {
    setTimeout(() => {
      setExistingUser(prevState => !prevState)
    }, 500)
  }

  const signupPatientHandler = async () => {
    try {
      // setLoading(true)

      const role = 'patient'

      const name = values.name.trim()
      const email = values.email.trim()
      const password = values.password

      if (!name) throw new Error('Please enter your name')
      if (name.length < 6)
        throw new Error('Name must be at least 6 characters long')

      if (!email) throw new Error('Please input your email')

      if (!password) throw new Error('Password is required')
      if (password.length < 5)
        throw new Error('Password must be at least 6 characters')

      await signupHandler(name, email, password, role)

      actions.resetForm({
        values: {
          name: '',
          email: '',
          password: ''
        }
      })

      // router.replace('/patient/dashboard') // Handled in the context file.

      // setLoading(false)
    } catch (error) {
      console.error('patient signup login: ', error)
      actions.setSubmitting(false)
      throw new Error(error)
    }
  }

  const loginPatientHandler = async (values, actions) => {
    const role = 'patient'
    try {
      // setLoading(true)
      const email = values.email.trim()
      const password = values.password

      if (!email) throw new Error('Email is required')
      if (!password) throw new Error('Password is required')
      if (password.length < 5)
        throw new Error('Password must be at least 6 characters')

      await signinHandler(email, password, role)

      actions.resetForm({
        values: {
          email: '',
          password: ''
        }
      })

      // router.replace('/patient/dashboard') // Handled in the context file.
      // setLoading(false)
    } catch (error) {
      console.error('patient login error: ', error)
      actions.setSubmitting(false)
      throw new Error(error)
    }
  }

  // if (loading) return <p>Loading...!</p>

  const signupValues = {
    name: '',
    email: '',
    password: ''
  }
  const loginValues = {
    email: '',
    password: ''
  }

  return (
    <Formik
      initialValues={existingUser ? signupValues : loginValues}
      onSubmit={existingUser ? signupPatientHandler : loginPatientHandler}
      validationSchema={existingUser ? signupSchema : signinSchema}
    >
      {({
        values,
        handleBlur,
        handleChange,
        errors,
        touched,
        isSubmitting,
        isValid
      }) => (
        <Form>
          {existingUser && (
            <CustomInput
              type='text'
              id='name'
              name='name'
              placeholder='Name'
              label='Name'
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              value={values.name}
            />
          )}

          <CustomInput
            type='email'
            id='email'
            name='email'
            placeholder='Email'
            label='Email'
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            value={values.email}
          />

          <CustomInput
            type={showPassword ? 'text' : 'password'}
            id='password'
            name='password'
            placeholder='Password'
            label='Password'
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
            value={values.password}
            showPassword={showPassword}
            togglePassword={showPasswordHandler}
          />

          <div className='mt-4 flex items-center gap-2'>
            <p className='mb-0'>
              {existingUser ? 'Account exists?' : 'New user?'}
            </p>
            <button onClick={existingUserHandler} className='cursor-pointer'>
              {existingUser ? 'Login' : 'Signup'}
            </button>
          </div>

          <div>
            <button className='cursor-pointer' type='submit'>
              {existingUser ? 'Signup' : 'Login'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
