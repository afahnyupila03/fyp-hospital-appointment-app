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

  // Define 2-hour intervals
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
      console.log('doctor time: ', data)
      // Helper function to convert time strings to minutes
      const timeStringToMinutes = timeStr => {
        const [time, modifier] = timeStr.trim().split(' ')
        let [hours, minutes] = time.split(':').map(Number)
        if (modifier === 'PM' && hours !== 12) hours += 12
        if (modifier === 'AM' && hours === 12) hours = 0
        return hours * 60 + minutes
      }

      // Helper function to parse interval strings into start and end minutes
      const parseInterval = intervalStr => {
        const [startStr, endStr] = intervalStr.split(' - ')
        return [timeStringToMinutes(startStr), timeStringToMinutes(endStr)]
      }

      // Create a lookup for quick access
      const scheduleLookup = {}

      data.schedules.forEach(({ day, time }) => {
        if (!scheduleLookup[day]) {
          scheduleLookup[day] = new Set()
        }

        // Parse the doctor's scheduled time
        const [scheduleStart, scheduleEnd] = parseInterval(time)

        // Check each 2-hour interval for overlap
        timeIntervals.forEach(interval => {
          const [intervalStart, intervalEnd] = parseInterval(interval)

          // Check for any overlap
          if (scheduleStart < intervalEnd && scheduleEnd > intervalStart) {
            scheduleLookup[day].add(interval)
          }
        })
      })

      // Generate table rows with days as rows and time intervals as columns
      const rows = daysOfWeek.map((day, idx) => (
        <tr key={idx}>
          <td className='font-semibold'>{day}</td>
          {timeIntervals.map((interval, i) => (
            <td
              key={i}
              className={
                scheduleLookup[day] && scheduleLookup[day].has(interval)
                  ? 'bg-green-300 text-center'
                  : 'text-center'
              }
            >
              {scheduleLookup[day] && scheduleLookup[day].has(interval)
                ? 'Available'
                : ''}
            </td>
          ))}
        </tr>
      ))

      setTableData(rows)
    }
  }, [data])

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>{error}</p>

  const { name, email, specialization, department, appointments, _id } = data
  const appointmentCount = appointments?.length || 0

  const tableHeaders = (
    <>
      <th>Day</th>
      {timeIntervals.map((interval, idx) => (
        <th key={idx}>{interval}</th>
      ))}
    </>
  )

  return (
    <div>
      <div>
        <h3>Doctor Information</h3>
        <div>
          <p>Name: {name}</p>
          <p>Email: {email}</p>
        </div>
        <div>
          <p>Specialty: {specialization}</p>
          <p>Department: {department}</p>
        </div>
        <div>
          <h3>Appointment Count</h3>

          <p>Total booked appointments: {appointmentCount}</p>
        </div>
        <div className='mt-4'>
          <Link href={{
            pathname: '/patient/dashboard/book-appointment',
            query: {
              id: _id,
              name
            }
          }}> Book Appointment</Link>
         
        </div>

        <div>
          <h3>Hospital Schedule</h3>
          <Table tableHeaders={tableHeaders} tableData={tableData} />
        </div>
      </div>
    </div>
  )
}
