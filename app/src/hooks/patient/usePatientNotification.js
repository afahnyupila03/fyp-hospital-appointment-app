import {
  updatePatientNotificationStatus,
  viewPatientNotification,
  viewPatientNotifications,
} from "@/api/appointment/patient/patientNotificationService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePatientNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: viewPatientNotifications,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePatientNotification = (id) => {
  return useQuery({
    queryKey: ["notification", id],
    queryFn: () => viewPatientNotification(id),
    enabled: !!id,
  });
};

export const useUpdatePatientNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updatePatientNotificationStatus(id, { payload }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["notification", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};
