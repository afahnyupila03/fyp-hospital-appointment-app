import {
  viewDoctorNotifications,
  viewDoctorNotification,
  updateDoctorNotificationStatus,
  requestDoctorNotificationPermission,
  deleteDoctorNotification
} from '@/api/appointment/doctor/notificationService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useDoctorNotificationPermission = () => {
  return useMutation({
    mutationFn: ({ granted }) =>
      requestDoctorNotificationPermission({ granted })
  })
}

export const useDoctorNotifications = (page, limit) => {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => viewDoctorNotifications(page, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000
  })
}

export const useDoctorNotification = id => {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => viewDoctorNotification(id),
    enabled: !!id
  })
}

export const useUpdateDoctorNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) =>
      updateDoctorNotificationStatus(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ['notifications']
      })
      queryClient.invalidateQueries({
        queryKey: ['notification', id]
      })
    }
  })
}

export const useDeleteDoctorNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => deleteDoctorNotification(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['notifications']
      })
  })
}
