'use client'

import {
  useDoctorAppointment,
  useUpdateDoctorAppointment
} from '@/hooks/doctor/useDoctor'
import { Formik, Form } from 'formik'
import CustomInput from '@/components/CustomInput'

export const AppointmentId = ({ id }) => {
  const { data, isLoading, isError, error, refetch } = useDoctorAppointment(id)
  const { mutateAsync: updateAppointment } = useUpdateDoctorAppointment()

  if (isLoading) return <p>Loading appointment details...</p>
  if (isError) return <p>{`${error.message} - ${error.name}`}</p>

  const { date, timeSlot, notes, reason, status, patientId } = data
  const { name, email } = patientId

  const updateActions = status => {
    const actions = {
      pending: [
        { actionKey: 'confirmed', label: 'Confirm' },
        { actionKey: 'canceled', label: 'Cancel' }
      ],
      confirmed: [
        { actionKey: 'completed', label: 'Complete' },
        { actionKey: 'canceled', label: 'Cancel' }
      ]
    }
    return actions[status] || []
  }

  const handleStatusChange = async newStatus => {
    if (newStatus === status) return

    const handlers = {
      completed: completeHandler,
      confirmed: confirmHandler,
      canceled: cancelHandler
    }

    if (handlers[newStatus]) {
      await handlers[newStatus]()
    }
  }

  const completeHandler = async () => {
    try {
      await updateAppointment({ id, status: 'completed' })
      refetch()
    } catch (error) {
      console.error('Failed to complete appointment:', error)
    }
  }

  const confirmHandler = async () => {
    try {
      await updateAppointment({ id, status: 'confirmed' })
      refetch()
    } catch (error) {
      console.error('Failed to confirm appointment:', error)
    }
  }

  const cancelHandler = async () => {
    try {
      await updateAppointment({ id, status: 'canceled' })
      refetch()
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    }
  }

  return (
    <div className='max-w-3xl mx-auto px-4 py-6 space-y-6'>
      <div className='bg-white shadow-md rounded-lg p-4'>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>
          Patient Contact
        </h2>
        <p className='text-gray-600'>
          <span className='font-medium'>Name:</span> {name}
        </p>
        <p className='text-gray-600'>
          <span className='font-medium'>Email:</span> {email}
        </p>
      </div>

      <div className='bg-white shadow-md rounded-lg p-4'>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
          Appointment Details
        </h3>
        <p className='text-gray-600 mb-1'>
          <span className='font-medium'>Day - Time:</span>{' '}
          {`${date} - ${timeSlot}`}
        </p>
        <p className='text-gray-600 mb-1'>
          <span className='font-medium'>Reason:</span> {reason}
        </p>
        <p className='text-gray-600 mb-4'>
          <span className='font-medium'>Note:</span> {notes}
        </p>

        <Formik initialValues={{ status }} onSubmit={() => {}}>
          {({ handleBlur }) => (
            <Form>
              <CustomInput
                as={
                  status === 'canceled' || status === 'completed'
                    ? 'input'
                    : 'select'
                }
                label='Status'
                placeholder={status}
                readOnly={status === 'canceled' || status === 'completed'}
                id='status'
                name='status'
                onChange={async e => await handleStatusChange(e.target.value)}
                onBlur={handleBlur}
              >
                {status !== 'canceled' && status !== 'completed' && (
                  <>
                    <option value={status}>{status}</option>
                    {updateActions(status).map(action => (
                      <option value={action.actionKey} key={action.actionKey}>
                        {action.label}
                      </option>
                    ))}
                  </>
                )}
              </CustomInput>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
