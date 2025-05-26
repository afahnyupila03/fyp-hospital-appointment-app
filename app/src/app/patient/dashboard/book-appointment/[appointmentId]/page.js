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
      console.log('appointment day: ', date)

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

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>{error}</p>

  if (data) {
    console.log('appointment data: ', data?.doctorId)
  }

  let doctorOptions
  if (loadingDoctors) {
    doctorOptions = (
      <option value='' disabled>
        Loading doctors
      </option>
    )
  } else if (isDoctorsError) {
    doctorOptions = (
      <option value='' disabled>
        {doctorsError}
      </option>
    )
  } else if (doctorsData) {
    doctorOptions = doctorsData?.doctors.map(doctor => {
      console.log('selected doctor: ', doctor._id, doctor.name)
      return (
        <option key={doctor._id} value={doctor._id}>
          {doctor.name}
        </option>
      )
    })
  }

  const reasons = [
    {
      key: 'consultation',
      label: 'Consultation'
    },
    { key: 'follow-up', label: 'Follow-up' },
    { key: 'referral', label: 'Referral' }
  ]

  const updateAppointmentHandler = async values => {
    console.log('updating')
    let id
    if (data) {
      const { _id } = data
      id = _id
    }
    console.log('updating id: ', id)

    const payload = {
      doctor: values.doctor,
      date: values.day,
      timeSlot: values.time,
      reason: values.reason,
      notes: values.note
    }
    await updateAppointment({ id, payload })
    console.log('appointment update success')
    refetch()
  }

  return (
    <div>
      <p>Update an appointment ppp</p>
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
          <Form>
            <CustomInput
              as='select'
              id='doctor'
              name='doctor'
              label='Select doctor'
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

                // ❗ Invalidate previous time selection if not available in new schedule
                if (!timeStillValid && values.time) {
                  setFieldValue('time', '')
                  alert(
                    'Selected time is not available for this doctor. Please select a new time.'
                  )
                }
              }}
              errors={errors}
              touched={touched}
            >
              <option value={values.doctor}>{selectedDoctor}</option>
              {doctorOptions}
            </CustomInput>

            {/* Display selected doctor's available days */}
            {doctorSchedule.length > 0 && (
              <div>
                <h4>Doctor Availability</h4>
                <ul>
                  {doctorSchedule?.map((s, i) => (
                    <li key={s._id || i}>
                      <span>{s.day}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <CustomInput
                id='day'
                name='day'
                type='date'
                value={values.day}
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
                <option value={values.time}>{values.time}</option>
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
              label='Reason'
              placeholder='Appointment reason'
              name='reason'
              onChange={handleChange}
              value={values.reason}
              onBlur={handleBlur}
            >
              <option value={values.reason}>{values.reason}</option>
              {reasons.map(r => (
                <option value={r.key} key={r.key}>
                  {r.label}
                </option>
              ))}
            </CustomInput>

            <CustomInput
              as='textarea'
              id='note'
              name='note'
              label='Notes'
              placeholder='Please give a brief explanation'
              value={values.note}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors}
              touched={touched}
            />

            <button type='submit' disabled={isSubmitting || !isValid}>
              Update
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
