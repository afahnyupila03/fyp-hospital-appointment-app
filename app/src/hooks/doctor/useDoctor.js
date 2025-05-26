import {
  updateAppointmentService,
  viewAppointmentService,
  viewAppointmentsService
} from '@/api/appointment/doctor/service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDoctorNotifications } from './useDoctorNotification'

export const useDoctorAppointments = (page, limit) => {
  return useQuery({
    queryKey: ['appointments', page],
    queryFn: () => viewAppointmentsService(page, limit),

    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000
  })
}

export const useDoctorAppointment = id => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => viewAppointmentService(id),
    enabled: !!id
  })
}

export const useUpdateDoctorAppointment = () => {
  const queryClient = useQueryClient()

  const { refetch } = useDoctorNotifications()

  return useMutation({
    mutationFn: ({ id, status }) => updateAppointmentService(id, { status }),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: ['appointments']
      })
      await queryClient.invalidateQueries({
        queryKey: ['appointment', id]
      })
      await refetch()
    }
  })
}
