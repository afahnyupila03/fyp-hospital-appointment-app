'use client'

import CustomInput from '@/components/CustomInput'
import {
  useCreateAppointment,
  usePatientDoctors
} from '@/hooks/patient/usePatient'
import { Form, Formik } from 'formik'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function BookAppointmentPage () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const name = searchParams.get('name')
  console.log(id, name)

  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctorSchedule, setDoctorSchedule] = useState([])

  const { data, isLoading, isError, error, refetch } = usePatientDoctors()

  useEffect(() => {
    if (selectedDoctor && data?.doctors) {
      const doctor = data.doctors.find(doc => doc._id === selectedDoctor)
      if (doctor?.schedules) {
        setDoctorSchedule(doctor.schedules)
      } else {
        setDoctorSchedule([])
      }
    } else {
      setDoctorSchedule([])
    }
  }, [selectedDoctor, data])

  // useEffect for doctorId && doctorName as query to book appointment.
  useEffect(() => {
    if (id && name && data?.doctors) {
      const doctor = data?.doctors.find(doc => doc._id === id)
      console.log('query doctor: ', doctor)
      if (doctor) {
        setSelectedDoctor(doctor._id)
        setDoctorSchedule(selectedDoctor.schedules || [])
      }
    }
  }, [id, name, data?.doctors])

  const { mutateAsync: bookAppointment } = useCreateAppointment()

  const bookAppointmentHandler = async values => {
    const data = {
      date: values.day,
      timeSlot: values.time,
      doctor: values.doctor,
      reason: values.reason,
      notes: values.notes
    }

    try {
      console.log('creating appointment...')
      await bookAppointment({ data })
      console.log('appointment created.')

      if (id && name) {
        router.push('/patient/dashboard')
      } else {
        router.push('/patient/dashboard/appointments')
      }
    } catch (error) {
      console.error('error booking appointment: ', error)
      throw new Error(error)
    }
  }

  const reasons = [
    {
      key: 'consultation',
      label: 'Consultation'
    },
    { key: 'follow-up', label: 'Follow-up' },
    { key: 'referral', label: 'Referral' }
  ]

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white shadow rounded-lg'>
      <Formik
        initialValues={
          id && name
            ? {
                doctor: id,
                time: '',
                day: '',
                reason: '',
                notes: ''
              }
            : {
                doctor: '',
                time: '',
                day: '',
                reason: '',
                notes: ''
              }
        }
        onSubmit={bookAppointmentHandler}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          isSubmitting,
          isValid,
          setFieldValue
        }) => (
          <Form className='space-y-6'>
            <p className='bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded'>
              <span className='font-bold'>*</span> For any doctor selected, you
              can select appointment day and time based off the doctor's
              hospital schedule.
              <span className='font-bold'>*</span>
            </p>

            {id && name ? (
              <CustomInput
                readOnly='true'
                label='Doctor'
                id='doctor'
                name='doctor'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
                value={name}
              />
            ) : (
              <CustomInput
                as='select'
                id='doctor'
                name='name'
                label='Select doctor'
                onChange={e => {
                  const selected = e.target.value
                  setSelectedDoctor(selected)
                  setFieldValue('doctor', selected)
                }}
                onBlur={handleBlur}
                value={values.doctor}
                errors={errors}
                touched={touched}
              >
                <option value=''>Select doctor</option>
                {isLoading ? (
                  <option disabled>Loading doctors...</option>
                ) : isError ? (
                  <option disabled>{error}</option>
                ) : (data && data?.count) === 0 ? (
                  <option disabled>No registered doctors</option>
                ) : (
                  data?.doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))
                )}
              </CustomInput>
            )}

            {/* Display selected doctor's available days */}
            {doctorSchedule.length > 0 && (
              <div className='mb-4'>
                <h4 className='font-semibold text-lg mb-2'>
                  Doctor Availability
                </h4>
                <ul className='list-disc list-inside pl-4 text-gray-700'>
                  {doctorSchedule.map(s => (
                    <li key={s._id}>
                      <span className='font-medium'>{s.day}:</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='grid grid-cols-1 gap-4'>
              <CustomInput
                id='day'
                name='day'
                type='date'
                label='Day'
                placeholder='Appointment date'
                onChange={e => {
                  const inputDate = new Date(e.target.value)
                  const today = new Date()

                  // Zero out the time for accurate date comparison
                  inputDate.setHours(0, 0, 0, 0)
                  today.setHours(0, 0, 0, 0)

                  // Get selected day of the week in title case (e.g. "Monday")
                  const days = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                  ]
                  const inputDay = days[inputDate.getDay()]

                  if (inputDate < today) {
                    setFieldValue('day', '')
                    alert("Can't book appointment for a date in the past")
                  } else if (!doctorSchedule.some(s => s.day === inputDay)) {
                    setFieldValue('day', '')
                    alert(`Doctor is not available on ${inputDay}`)
                  } else {
                    setFieldValue('day', e.target.value)
                  }
                }}
                onBlur={handleBlur}
                errors={errors}
                touched={touched}
                value={values.day}
                min={new Date().toISOString().split('T')[0]} // disables past dates
              />

              <CustomInput
                id='time'
                name='time'
                as='select'
                label='Time'
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.time}
                errors={errors}
                touched={touched}
              >
                <option value=''>Select appointment time</option>
                {doctorSchedule.map((s, i) => (
                  <option key={s._id} value={s.time}>
                    {s.time}
                  </option>
                ))}
              </CustomInput>
            </div>

            <CustomInput
              as='select'
              id='reason'
              name='reason'
              label='Reason'
              value={values.reason}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
            >
              <option value=''>Select appointment reason</option>
              {reasons.map(reason => (
                <option key={reason.key} value={reason.key}>
                  {reason.label}
                </option>
              ))}
            </CustomInput>

            <CustomInput
              label='Note'
              placeholder='Please give a brief explain'
              id='notes'
              name='notes'
              value={values.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
              as='textarea'
            />

            <button
              type='submit'
              className='bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition duration-200'
              title={
                isSubmitting
                  ? 'Submitting'
                  : !isValid
                  ? 'Complete form to submit'
                  : 'Submit'
              }
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Booking' : 'Book'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
