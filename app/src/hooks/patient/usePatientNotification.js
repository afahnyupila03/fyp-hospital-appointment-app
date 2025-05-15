import {
  updatePatientNotificationStatus,
  viewPatientNotification,
  viewPatientNotifications,
  deletePatientNotification,
  requestPatientNotificationPermission
} from '@/api/appointment/patient/patientNotificationService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const usePatientNotificationPermission = () => {
  return useMutation({
    mutationFn: ({ granted }) =>
      requestPatientNotificationPermission({ granted })
  })
}

export const usePatientNotifications = (page, limit, isPatient) => {
  return useQuery({
    queryKey: ['notifications', isPatient],
    queryFn: () => viewPatientNotifications(page, limit),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
    enabled: !!isPatient
  })
}

export const usePatientNotification = (id, isPatient) => {
  return useQuery({
    queryKey: ['notification', id, isPatient],
    queryFn: () => viewPatientNotification(id),
    enabled: !!id && !!isPatient
  })
}

export const useUpdatePatientNotification = (isPatient) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updatePatientNotificationStatus(id, { payload }),
    onSuccess: (_, { id }) => {
      if (isPatient) {
        queryClient.invalidateQueries({
          queryKey: ['notification', id, isPatient]
        })
        queryClient.invalidateQueries({
          queryKey: ['notifications', isPatient]
        })
      }
    }
  })
}

export const useDeletePatientNotification = ( isPatient) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => deletePatientNotification(id),
    onSuccess: () => {
      if (isPatient) {
        queryClient.invalidateQueries({
          queryKey: ['notifications', isPatient]
        })
      }
    }
  })
}
