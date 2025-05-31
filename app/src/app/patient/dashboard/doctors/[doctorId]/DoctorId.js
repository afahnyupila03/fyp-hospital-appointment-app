'use client'

import Table from '@/components/Table'
import { usePatientDoctor } from '@/hooks/patient/usePatient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DoctorId ({ id }) {
  const { data, isLoading, isError, error } = usePatientDoctor(id)
  const [tableData, setTableData] = useState([])

  const router = useRouter()

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  const timeIntervals = Array.from({ length: 12 }, (_, i) => {
    const startHour = i * 2
    const endHour = startHour + 2
    const formatTime = hour => {
      const h = hour % 24
      const period = h >= 12 ? 'PM' : 'AM'
      const formattedHour = h % 12 === 0 ? 12 : h % 12
      return `${formattedHour}:00 ${period}`
    }
    return `${formatTime(startHour)} - ${formatTime(endHour)}`
  })

  useEffect(() => {
    if (data) {
      const timeStringToMinutes = timeStr => {
        const [time, modifier] = timeStr.trim().split(' ')
        let [hours, minutes] = time.split(':').map(Number)
        if (modifier === 'PM' && hours !== 12) hours += 12
        if (modifier === 'AM' && hours === 12) hours = 0
        return hours * 60 + minutes
      }

      const parseInterval = intervalStr => {
        const [startStr, endStr] = intervalStr.split(' - ')
        return [timeStringToMinutes(startStr), timeStringToMinutes(endStr)]
      }

      const scheduleLookup = {}

      data.schedules.forEach(({ day, time }) => {
        if (!scheduleLookup[day]) {
          scheduleLookup[day] = new Set()
        }

        const [scheduleStart, scheduleEnd] = parseInterval(time)

        timeIntervals.forEach(interval => {
          const [intervalStart, intervalEnd] = parseInterval(interval)
          if (scheduleStart < intervalEnd && scheduleEnd > intervalStart) {
            scheduleLookup[day].add(interval)
          }
        })
      })

      const rows = daysOfWeek.map((day, idx) => (
        <tr key={idx}>
          <td className='border border-gray-300 px-3 py-2 font-medium text-gray-800'>
            {day}
          </td>
          {timeIntervals.map((interval, i) => (
            <td
              key={i}
              className={`border border-gray-300 px-3 py-2 text-center ${
                scheduleLookup[day]?.has(interval)
                  ? 'bg-green-100 text-green-800 font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {scheduleLookup[day]?.has(interval) ? 'Available' : ''}
            </td>
          ))}
        </tr>
      ))

      setTableData(rows)
    }
  }, [data])

  if (isLoading) return <p className='text-gray-600 p-4'>Loading...</p>
  if (isError) return <p className='text-red-500 p-4'>{error}</p>

  const { name, email, specialization, department, appointments, _id } = data
  const appointmentCount = appointments?.length || 0

  const tableHeaders = (
    <>
      <th className='border border-gray-300 px-3 py-2 bg-gray-100 text-left'>
        Day
      </th>
      {timeIntervals.map((interval, idx) => (
        <th
          key={idx}
          className='border border-gray-300 px-3 py-2 bg-gray-100 text-xs text-gray-700'
        >
          {interval}
        </th>
      ))}
    </>
  )

  return (
    <div className='p-6 bg-white shadow rounded-lg space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
          Doctor Information
        </h3>
        <div className='text-gray-700'>
          <p>
            <span className='font-medium'>Name:</span> {name}
          </p>
          <p>
            <span className='font-medium'>Email:</span> {email}
          </p>
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
          Professional Details
        </h3>
        <div className='text-gray-700'>
          <p>
            <span className='font-medium'>Specialty:</span> {specialization}
          </p>
          <p>
            <span className='font-medium'>Department:</span> {department}
          </p>
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
          Appointments
        </h3>
        <p className='text-gray-700'>
          Total booked appointments:{' '}
          <span className='font-bold'>{appointmentCount}</span>
        </p>
      </div>

      <div>
        <Link
          href={{
            pathname: '/patient/dashboard/book-appointment',
            query: { id: _id, name }
          }}
          className='inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition'
        >
          Book Appointment
        </Link>
      </div>

      <div>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Hospital Schedule
        </h3>
        <div className='overflow-auto rounded border'>
          <Table tableHeaders={tableHeaders} tableData={tableData} />
        </div>
      </div>
    </div>
  )
}
