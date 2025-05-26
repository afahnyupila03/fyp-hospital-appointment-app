import {
  createAppointmentService,
  updateAppointmentService,
  viewAppointmentService,
  viewAppointmentsService,
  viewDoctorService,
  viewDoctorsService
} from '@/api/appointment/patient/service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePatientNotifications } from './usePatientNotification'

export const usePatientDoctors = (page, limit) => {
  return useQuery({
    queryKey: ['doctors', page],
    queryFn: () => viewDoctorsService(page, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000
  })
}

export const usePatientDoctor = id => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => viewDoctorService(id),
    enabled: !!id
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()

  const { refetch } = usePatientNotifications()

  return useMutation({
    mutationFn: ({ data }) => createAppointmentService(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await refetch()
    }
  })
}

export const useUpdatePatientAppointment = () => {
  const queryClient = useQueryClient()

  const { refetch } = usePatientNotifications()

  return useMutation({
    mutationFn: ({ id, payload }) => updateAppointmentService(id, payload),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: ['appointments']
      })
      await queryClient.invalidateQueries({
        queryKey: ['appointment', id]
      })
      await fetch()
    }
  })
}

export const usePatientAppointments = (page, limit) => {
  return useQuery({
    queryKey: ['appointments', page],
    queryFn: () => viewAppointmentsService(page, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000
  })
}

export const usePatientAppointment = id => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => viewAppointmentService(id),
    enabled: !!id
  })
}
