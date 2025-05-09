import {
  updateAppointmentService,
  viewAppointmentService,
  viewAppointmentsService,
} from "@/api/appointment/doctor/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDoctorAppointments = (page, limit) => {
  return useQuery({
    queryKey: ["appointments", page],
    queryFn: () => viewAppointmentsService(page, limit),

    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDoctorAppointment = (id) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => viewAppointmentService(id),
    enabled: !!id,
  });
};

export const useUpdateDoctorAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateAppointmentService(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointments"],
      });
    },
  });
};
