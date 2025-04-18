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
