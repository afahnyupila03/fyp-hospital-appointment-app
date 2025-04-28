import {
  createAppointmentService,
  updateAppointmentService,
  viewAppointmentService,
  viewAppointmentsService,
  viewDoctorService,
  viewDoctorsService,
} from "@/api/appointment/patient/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePatientDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: viewDoctorsService,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePatientDoctor = (id) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => viewDoctorService(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }) => createAppointmentService(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["create-appointment"] }),
  });
};

export const useUpdatePatientAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAppointmentService(id, { data }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["update-patient-appointment"],
      }),
  });
};

export const usePatientAppointments = () => {
  return useQuery({
    queryKey: ["patient-appointments"],
    queryFn: viewAppointmentsService,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePatientAppointment = (id) => {
  return useQuery({
    queryKey: ["patient-appointment", id],
    queryFn: () => viewAppointmentService(id),
    enabled: !!id,
  });
};
