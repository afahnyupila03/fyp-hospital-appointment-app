import {
  viewDoctorNotifications,
  viewDoctorNotification,
  updateDoctorNotificationStatus,
  requestDoctorNotificationPermission
} from "@/api/appointment/doctor/notificationService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDoctorNotificationPermission = () => {
  return useMutation({
    mutationFn: ({ granted }) =>
      requestDoctorNotificationPermission({ granted }),
  });
};

export const useDoctorNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: viewDoctorNotifications,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDoctorNotification = (id) => {
  return useQuery({
    queryKey: ["notification", id],
    queryFn: () => viewDoctorNotification(id),
    enabled: !!id,
  });
};

export const useUpdateDoctorNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      updateDoctorNotificationStatus(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notification", id],
      });
    },
  });
};
