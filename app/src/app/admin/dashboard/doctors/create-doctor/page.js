'use client'

import CustomInput from '@/components/CustomInput'
import {
  useCreateDoctor,
  useDoctorData,
  useDoctorsMeta
} from '@/hooks/admin/useAdmin'
import { createDoctorSchema } from '@/schema/schema'
import { Formik, Form, FieldArray } from 'formik'
import { useRouter } from 'next/navigation'

export default function CreateDoctorPage () {
  const router = useRouter()
  const { data } = useDoctorsMeta()
  const specialization = data?.specialties
  const department = data?.departments

  const initialValues = {
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
  }

  const { mutateAsync: createDoctor } = useCreateDoctor()

  const createDoctorHandler = async (values, actions) => {
    try {
      await createDoctor(values)
      router.push('/admin/dashboard/doctors')
      actions.resetForm({ values: initialValues })
    } catch (error) {
      console.error('Error creating doctor profile: ', error)
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h2 className='text-2xl font-semibold mb-6 text-center'>
        Create Doctor Profile
      </h2>

      <div className='bg-white shadow-md rounded-lg p-6'>
        <Formik
          initialValues={initialValues}
          // validationSchema={createDoctorSchema}
          onSubmit={createDoctorHandler}
        >
          {({
            values,
            handleChange,
            handleBlur,
            errors,
            touched,
            isSubmitting
          }) => (
            <Form className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <CustomInput
                  placeholder='Doctor Name'
                  label='Doctor Name'
                  value={values.name}
                  name='name'
                  id='name'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  touched={touched}
                  errors={errors}
                  type='text'
                />
                <CustomInput
                  placeholder='Doctor Email'
                  label='Doctor Email'
                  value={values.email}
                  name='email'
                  id='email'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  touched={touched}
                  errors={errors}
                  type='email'
                />
                <CustomInput
                  placeholder='Doctor Password'
                  label='Password'
                  value={values.password}
                  name='password'
                  id='password'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  touched={touched}
                  errors={errors}
                  type='text'
                />
                <CustomInput
                  label='Specialization'
                  as='select'
                  id='specialization'
                  name='specialization'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.specialization}
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
                  id='department'
                  name='department'
                  label='Department'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.department}
                >
                  <option value=''>Select department</option>
                  {department?.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </CustomInput>
              </div>

              {/* Schedule Section */}
              <div>
                <h3 className='text-lg font-medium mb-2'>Schedule</h3>
                <FieldArray name='schedule'>
                  {({ push, remove }) => (
                    <div className='space-y-4'>
                      {values.schedule.map((item, index) => (
                        <div
                          key={index}
                          className='border rounded p-4 bg-gray-50 space-y-4'
                        >
                          <CustomInput
                            placeholder='Day (e.g., Monday)'
                            label='Day'
                            value={item.day}
                            name={`schedule.${index}.day`}
                            id={`schedule.${index}.day`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            type='text'
                          />

                          {/* Time Slots */}
                          <FieldArray name={`schedule.${index}.times`}>
                            {({ push: pushTime, remove: removeTime }) => (
                              <div className='space-y-2'>
                                {item.times.map((time, timeIdx) => (
                                  <div
                                    key={timeIdx}
                                    className='flex gap-2 items-center'
                                  >
                                    <input
                                      type='text'
                                      name={`schedule.${index}.times.${timeIdx}`}
                                      value={time}
                                      onChange={handleChange}
                                      placeholder='e.g., 10:00 AM - 10:30 AM'
                                      className='border p-2 rounded w-full'
                                    />
                                    <button
                                      type='button'
                                      onClick={() => removeTime(timeIdx)}
                                      className='text-red-600 text-sm'
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type='button'
                                  onClick={() => pushTime('')}
                                  className='text-blue-600 text-sm mt-2'
                                >
                                  + Add Time Slot
                                </button>
                              </div>
                            )}
                          </FieldArray>

                          <button
                            type='button'
                            onClick={() => remove(index)}
                            className='text-red-600 text-sm'
                          >
                            Remove Schedule
                          </button>
                        </div>
                      ))}
                      <button
                        type='button'
                        onClick={() => push({ day: '', times: [''] })}
                        className='text-green-600 text-sm'
                      >
                        + Add New Schedule
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Submit Button */}
              <div className='pt-4'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition'
                >
                  {isSubmitting ? 'Creating...' : 'Create Doctor'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
