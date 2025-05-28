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
      setExistingUser(prevState => !prevState)
    }, 500)
  }

  const handleSignup = async (values, actions) => {
    console.log(values)
    try {
      const role = 'admin'

      const email = (values.email || '').trim()
      const password = values.password
      const name = (values.name || '').trim()

      if (!name) throw new Error('Name is required')
      if (name.length < 6) throw new Error('Name must be at least 6 characters')

      if (!email) throw new Error('Email is required')
      if (!password) throw new Error('Password is required')
      if (password.length < 5)
        throw new Error('Password must be at least 6 characters')

      await signupHandler(values, role)
      console.log('SIGNED_UP_USER: ', user)
      // router.replace('/admin/dashboard') // Handled in the context file.
      actions.resetForm()
    } catch (error) {
      console.error('SIGNED_UP_USER_ERROR: ', error.message)
      actions.setSubmitting(false)
      throw error
    }
  }

  const handleSignin = async (values, actions) => {
    try {
      const role = 'admin'

      const email = values.email
      const password = values.password

      if (!email) {
        const error = new Error('Email is required')
        throw error
      }
      if (!password) {
        const error = new Error('Password is required')
        throw error
      }

      await signinHandler(email, password, role)
      // router.replace('/admin/dashboard') // Handled in the context file.
      actions.resetForm()
    } catch (error) {
      console.error('SIGNED_IN_USER_ERROR: ', error)

      actions.setSubmitting(false)
      throw error
    }
  }

  return (
    <Formik
      initialValues={{
        email: '',
        name: '',
        password: ''
      }}
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
        <Form>
          {existingUser ? 'Create Account' : 'Log In'}

          {existingUser && (
            <CustomInput
              onChange={handleChange}
              id='name'
              name='name'
              type='text'
              onBlur={handleBlur}
              value={values.name}
              placeholder='Enter Name'
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
            errors={errors}
            touched={touched}
          />

          <CustomInput
            onChange={handleChange}
            id='password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            onBlur={handleBlur}
            value={values.password}
            placeholder='Enter Password'
            label='Password'
            errors={errors}
            touched={touched}
            togglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          {}

          <p className='block text-lg font-medium leading-6  text-red-500'>
            {existingUser ? 'Already have an account ?' : 'New user ?'}
          </p>
          <button
            className='block ml-2 text-lg font-medium leading-6 text-white'
            type='button'
            onClick={handleExistingUser}
          >
            {existingUser ? 'Log in' : 'Create account'}
          </button>

          <button
            className='block text-lg font-medium leading-6 rounded-md p-4 mx-4 my-4 bg-gray-800 text-white'
            type='submit'
            disabled={isSubmitting && errors}
          >
            {existingUser ? 'Create Account' : 'Log in'}
          </button>
        </Form>
      )}
    </Formik>
  )
}
