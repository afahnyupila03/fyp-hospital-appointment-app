import * as yup from "yup";

export const signupSchema = () =>
  yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(6, "Name must be at least 6 characters long")
      .required("Name is required"),

    email: yup
      .string()
      .trim()
      .email("Please enter a valid email address")
      .required("Email is required"),

    password: yup
      .string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
  });

export const signinSchema = () =>
  yup.object().shape({
    email: yup
      .string()
      .trim()
      .email("Please enter a valid email address")
      .required("Email is required"),

    password: yup
      .string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
  });

export const createDoctorSchema = () =>
  yup.object().shape({
    name: yup
      .string()
      .trim()
      .required("Name is required")
      .min(8, "Name field must be a minimum of 6 characters long"),

    email: yup
      .string()
      .trim()
      .email("Please enter a valid email address")
      .required("Email is required"),

    password: yup
      .string()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),

    specialization: yup
      .string()
      .trim()
      .required(
        "Please select field of specialty, if general, select GENERAL "
      ),
    department: yup
      .string()
      .trim()
      .required("Please select department, if general, select GENERAL "),

    day: yup.string().trim().required("Day is required"),
    time: yup.string().trim().required("Time is required."),
  });

  export const updateDoctorSchema = () => yup.object().shape({})
