import {
  updateAppointmentService,
  viewAppointmentService,
  viewAppointmentsService,
} from "@/api/appointment/doctor/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDoctorAppointments = () => {
  return useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: viewAppointmentsService,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDoctorAppointment = (id) => {
  return useQuery({
    queryKey: ["doctor-appointment", id],
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
        queryKey: ["updated-doctor-appointment"],
      });
    },
  });
};
