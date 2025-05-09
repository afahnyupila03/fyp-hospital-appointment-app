import {
  viewDoctorNotifications,
  viewDoctorNotification,
  updateDoctorNotificationStatus,
} from "@/api/appointment/doctor/notificationService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    mutationFn: ({ id, payload = {} }) =>
      updateDoctorNotificationStatus(id, { payload }),
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
