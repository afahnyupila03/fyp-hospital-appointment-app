'use client'

import CustomInput from '@/components/CustomInput'
import {
  useCreateDoctor,
  useDoctorData,
  useDoctorsMeta,
  useUpdateDoctor
} from '@/hooks/admin/useAdmin'
import { createDoctorSchema } from '@/schema/schema'
import { Formik, Form, FieldArray } from 'formik'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function CreateDoctorPage () {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { data } = useDoctorsMeta()

  const doctorId = params.doctorId
  const isEditing = searchParams.get('editing') === 'true'

  const { data: docData, isLoading } = useDoctorData(doctorId)

  const specialization = data?.specialties
  const department = data?.departments

  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    department: '',
    schedule: [
      {
        day: '',
        times: ['']
      }
    ]
  })

  useEffect(() => {
    if (isEditing && doctorId && docData) {
      setInitialValues({
        name: docData.name || '',
        email: docData.email || '',
        password: '',
        specialization: docData.specialization || '',
        department: docData.department || '',
        schedule: docData.schedule || [{ day: '', times: [''] }]
      })
    }
  }, [isEditing, doctorId, docData])

  const { mutateAsync: updateDoctor } = useUpdateDoctor()

  const updateDoctorHandler = async (values, actions) => {
    try {
      await updateDoctor({ id: doctorId, updatedData: values })
      router.replace('/admin/dashboard/doctors')
      actions.resetForm({ values: initialValues })
    } catch (error) {
      console.error('Error creating doctor profile: ', error)
      throw error
    }
  }

  if (isLoading)
    return (
      <p className='text-center text-gray-500'>Loading doctor information...</p>
    )

  return (
    <div className='max-w-3xl mx-auto px-6 py-10 bg-white shadow rounded-md'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
        {isEditing ? 'Update Doctor Profile' : 'Create Doctor Profile'}
      </h2>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        // validationSchema={createDoctorSchema}
        onSubmit={updateDoctorHandler}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          isSubmitting,
          setFieldValue
        }) => (
          <Form className='space-y-6'>
            <CustomInput
              label='Doctor Name'
              id='name'
              name='name'
              type='text'
              placeholder="Enter doctor's name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched}
              errors={errors}
            />

            <CustomInput
              label='Doctor Email'
              id='email'
              name='email'
              type='email'
              placeholder="Enter doctor's email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched}
              errors={errors}
            />

            <CustomInput
              as='select'
              label='Specialization'
              id='specialization'
              name='specialization'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.specialization}
              errors={errors}
              touched={touched}
            >
              <option value=''>Select specialization</option>
              {specialization?.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </CustomInput>

            <CustomInput
              as='select'
              label='Department'
              id='department'
              name='department'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.department}
              errors={errors}
              touched={touched}
            >
              <option value=''>Select department</option>
              {department?.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </CustomInput>

            <div>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                Schedule
              </h3>
              <FieldArray name='schedule'>
                {({ push, remove }) => (
                  <div className='space-y-6'>
                    {values.schedule?.map((scheduleItem, index) => (
                      <div
                        key={index}
                        className='border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50'
                      >
                        <CustomInput
                          label='Day'
                          id={`schedule.${index}.day`}
                          name={`schedule.${index}.day`}
                          type='text'
                          placeholder='e.g., Monday'
                          value={scheduleItem.day}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          errors={errors}
                          touched={touched}
                        />

                        <FieldArray name={`schedule.${index}.times`}>
                          {({ push: pushTime, remove: removeTime }) => (
                            <div className='space-y-2'>
                              {scheduleItem.times.map((time, timeIdx) => (
                                <div key={timeIdx} className='flex gap-2'>
                                  <input
                                    type='text'
                                    name={`schedule.${index}.times.${timeIdx}`}
                                    value={time}
                                    onChange={handleChange}
                                    placeholder='e.g., 10:00 AM - 11:00 AM'
                                    className='flex-1 border border-gray-300 rounded px-3 py-2'
                                  />
                                  <button
                                    type='button'
                                    onClick={() => removeTime(timeIdx)}
                                    className='text-sm text-red-500 hover:underline'
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              <button
                                type='button'
                                onClick={() => pushTime('')}
                                className='text-blue-500 text-sm mt-1 hover:underline'
                              >
                                + Add Time Slot
                              </button>
                            </div>
                          )}
                        </FieldArray>

                        <button
                          type='button'
                          onClick={() => remove(index)}
                          className='text-red-600 text-sm hover:underline'
                        >
                          Remove Schedule
                        </button>
                      </div>
                    ))}
                    <button
                      type='button'
                      onClick={() => push({ day: '', times: [''] })}
                      className='text-green-600 hover:underline text-sm'
                    >
                      + Add New Schedule
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className='pt-4'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded shadow'
              >
                {isSubmitting ? 'Updating...' : 'Update Doctor'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
