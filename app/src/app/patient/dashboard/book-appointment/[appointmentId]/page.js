'use client'

import CustomInput from '@/components/CustomInput'
import {
  usePatientAppointment,
  usePatientDoctors,
  useUpdatePatientAppointment
} from '@/hooks/patient/usePatient'
import { Formik, Form } from 'formik'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UpdateAppointmentPage () {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const appointmentId = params.appointmentId
  const isEditing = searchParams.get('editing') === 'true'

  const { data, isLoading, isError, error, refetch } =
    usePatientAppointment(appointmentId)

  const {
    data: doctorsData,
    isLoading: loadingDoctors,
    isError: isDoctorsError,
    error: doctorsError
  } = usePatientDoctors()

  const { mutateAsync: updateAppointment } = useUpdatePatientAppointment()

  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctorSchedule, setDoctorSchedule] = useState([])

  const [initialValues, setInitialValues] = useState({
    doctor: '',
    note: '',
    day: '',
    time: '',
    reason: ''
  })

  useEffect(() => {
    if (isEditing && appointmentId && data) {
      const { doctorId, timeSlot, date, notes, reason } = data
      const { _id, name, schedules } = doctorId

      setSelectedDoctor(name)

      setInitialValues({
        doctor: _id,
        note: notes,
        reason,
        time: timeSlot,
        day: date
      })

      setDoctorSchedule(schedules)

      if (selectedDoctor && doctorsData?.doctors) {
        const doctor = doctorsData?.doctors.find(
          doc => doc._id === selectedDoctor
        )
        if (doctor?.schedules) {
          setDoctorSchedule(doctor.schedules)
        }
      }
    }
  }, [isEditing, appointmentId, data, doctorsData])

  if (isLoading) return <p className='text-gray-500'>Loading...</p>
  if (isError) return <p className='text-red-500'>{error}</p>

  let doctorOptions
  if (loadingDoctors) {
    doctorOptions = (
      <option value='' disabled>
        Loading doctors...
      </option>
    )
  } else if (isDoctorsError) {
    doctorOptions = (
      <option value='' disabled>
        {doctorsError}
      </option>
    )
  } else if (doctorsData) {
    doctorOptions = doctorsData?.doctors.map(doctor => (
      <option key={doctor._id} value={doctor._id}>
        {doctor.name}
      </option>
    ))
  }

  const reasons = [
    { key: 'consultation', label: 'Consultation' },
    { key: 'follow-up', label: 'Follow-up' },
    { key: 'referral', label: 'Referral' }
  ]

  const updateAppointmentHandler = async values => {
    const id = data?._id
    const payload = {
      doctor: values.doctor,
      date: values.day,
      timeSlot: values.time,
      reason: values.reason,
      notes: values.note
    }
    await updateAppointment({ id, payload })
    refetch()
    router.push('/patient/dashboard/appointments')
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-semibold text-gray-800 mb-6'>
        Update Appointment
      </h1>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={updateAppointmentHandler}
      >
        {({
          values,
          handleChange,
          handleBlur,
          isSubmitting,
          isValid,
          errors,
          touched,
          setFieldValue
        }) => (
          <Form className='space-y-5 bg-white p-6 rounded-xl shadow border'>
            <CustomInput
              as='select'
              id='doctor'
              name='doctor'
              label='Select Doctor'
              onBlur={handleBlur}
              value={values.doctor}
              onChange={e => {
                const selectedId = e.target.value
                const selectedDoctor = doctorsData?.doctors.find(
                  doc => doc._id === selectedId
                )
                const newSchedules = selectedDoctor?.schedules || []
                const timeStillValid = newSchedules.some(
                  s => s.time === values.time
                )
                setSelectedDoctor(selectedDoctor?.name)
                setDoctorSchedule(newSchedules)
                setFieldValue('doctor', selectedId)

                if (!timeStillValid && values.time) {
                  setFieldValue('time', '')
                  alert('Selected time is not available for this doctor.')
                }
              }}
              errors={errors}
              touched={touched}
            >
              <option value={values.doctor}>{selectedDoctor}</option>
              {doctorOptions}
            </CustomInput>

            {doctorSchedule.length > 0 && (
              <div className='bg-gray-50 p-4 rounded'>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Doctor Availability
                </h4>
                <ul className='list-disc list-inside text-gray-600 text-sm'>
                  {doctorSchedule.map((s, i) => (
                    <li key={s._id || i}>{s.day}</li>
                  ))}
                </ul>
              </div>
            )}

            <CustomInput
              id='day'
              name='day'
              type='date'
              value={values.day}
              label='Appointment Date'
              placeholder='Select date'
              onChange={e => {
                const inputDate = new Date(e.target.value)
                const today = new Date()
                inputDate.setHours(0, 0, 0, 0)
                today.setHours(0, 0, 0, 0)
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
                  alert("Can't select a past date.")
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
              min={new Date().toISOString().split('T')[0]}
            />

            <CustomInput
              id='time'
              name='time'
              as='select'
              label='Time Slot'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.time}
              errors={errors}
              touched={touched}
            >
              <option value={values.time}>{values.time}</option>
              {doctorSchedule.map((s, i) => (
                <option key={s._id || i} value={s.time}>
                  {s.time}
                </option>
              ))}
            </CustomInput>

            <CustomInput
              as='select'
              id='reason'
              name='reason'
              label='Reason for Appointment'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.reason}
              errors={errors}
              touched={touched}
            >
              <option value={values.reason}>{values.reason}</option>
              {reasons.map(r => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </CustomInput>

            <CustomInput
              as='textarea'
              id='note'
              name='note'
              label='Additional Notes'
              placeholder='Provide context or details (optional)'
              value={values.note}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
            />

            <div className='pt-4'>
              <button
                type='submit'
                disabled={isSubmitting || !isValid}
                className={`w-full py-2 px-4 rounded text-white font-semibold transition ${
                  isSubmitting || !isValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Appointment'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
