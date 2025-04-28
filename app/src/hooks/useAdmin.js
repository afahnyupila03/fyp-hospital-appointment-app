import {
  archiveDoctorService,
  createDoctorService,
  getDoctorService,
  getDoctorsService,
  unarchiveDoctorService,
  updateDoctorService,
} from "@/api/admin/doctorManagementService";
import {
  archivePatientService,
  getPatientService,
  getPatientsService,
  unarchivePatientService,
} from "@/api/admin/patientManagementService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const fetchDoctorMeta = async () => {
  const res = await fetch("http://localhost:4000/api/meta/doctor-meta");
  if (!res.ok) {
    throw new Error("Error fetching doctor specialties and departments");
  }
  const { departments, specialties } = await res.json();

  console.log(`Doctor spec: ${specialties} and departments: ${departments}`);

  return { departments, specialties };
};

export const useDoctorsMeta = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["doctor-meta"],
      queryFn: fetchDoctorMeta,
    });
  }, [queryClient]);

  return useQuery({
    queryKey: ["doctor-meta"],
    queryFn: fetchDoctorMeta,
  });
};

export const usePatientsData = () => {
  return useQuery({
    queryKey: ["patients"],
    queryFn: getPatientsService,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePatientData = (id) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientService(id),
    enabled: !!id,
  });
};

export const useDoctorsData = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctorsService,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDoctorData = (id) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctorService(id),
    enabled: !!id,
  });
};

export const useArchivePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => archivePatientService(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archive-patient"] });
    },
  });
};

export const useUnarchivePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => unarchivePatientService(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unarchive-patient"],
      });
    },
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createDoctorService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, updatedData}) => updateDoctorService(id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useArchiveDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => archiveDoctorService(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["archive-doctor"],
      });
    },
  });
};

export const useUnarchiveDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }) => unarchiveDoctorService(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unarchive-doctor"],
      });
    },
  });
};
