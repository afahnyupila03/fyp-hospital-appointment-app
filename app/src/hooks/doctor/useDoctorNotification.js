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

export const useDoctorNotifications = (page, limit, isDoctor) => {
  return useQuery({
    queryKey: ['notifications', isDoctor],
    queryFn: () => viewDoctorNotifications(page, limit, isDoctor),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
    enabled: !!isDoctor
  })
}

export const useDoctorNotification = (id, isDoctor) => {
  return useQuery({
    queryKey: ['notification', id, isDoctor],
    queryFn: () => viewDoctorNotification(id),
    enabled: !!id && !!isDoctor
  })
}

export const useUpdateDoctorNotification = isDoctor => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) =>
      updateDoctorNotificationStatus(id, { status }),
    onSuccess: (_, { id }) => {
      if (isDoctor) {
        queryClient.invalidateQueries({
          queryKey: ['notifications', isDoctor]
        })
        queryClient.invalidateQueries({
          queryKey: ['notification', id, isDoctor]
        })
      }
    }
  })
}

export const useDeleteDoctorNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => deleteDoctorNotification(id),
    onSuccess: () => {
      if (isDoctor) {
        queryClient.invalidateQueries({
          queryKey: ['notifications', isDoctor]
        })
      }
    }
  })
}
