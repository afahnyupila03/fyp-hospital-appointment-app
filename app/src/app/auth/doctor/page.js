"use client";
import React, { useState } from "react";
import { Form, Formik } from "formik";
import { AppState } from "@/store/context";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/CustomInput";
import { signinSchema } from "@/schema/schema";

export default function DoctorAuth() {
  const { signinHandler } = AppState();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSignin = async (values, actions) => {
    try {
      const role = "doctor";

      const email = values.email;
      const password = values.password;

      if (!email) {
        const error = new Error("Email is required");
        throw error;
      }
      if (!password) {
        const error = new Error("Password is required");
        throw error;
      }

      const user = await signinHandler(email, password, role);
      console.log("SIGNED_IN_USER: ", user);
      router.replace("/");
      actions.resetForm();
    } catch (error) {
      console.error("SIGNED_IN_USER_ERROR: ", error.message);
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        email: "",
        name: "",
        password: "",
      }}
      validationSchema={signinSchema}
      onSubmit={handleSignin}
    >
      {({
        values,
        handleChange,
        handleBlur,
        isSubmitting,
        errors,
        touched,
      }) => (
        <Form>
          <CustomInput
            onChange={handleChange}
            id="email"
            name="email"
            type="email"
            onBlur={handleBlur}
            value={values.email}
            placeholder="Enter email address"
            label="Email"
            errors={errors}
            touched={touched}
          />

          <CustomInput
            onChange={handleChange}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            onBlur={handleBlur}
            value={values.password}
            placeholder="Enter Password"
            label="Password"
            errors={errors}
            touched={touched}
            togglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          <button
            className="block text-lg font-medium leading-6 rounded-md p-4 mx-4 my-4 bg-gray-800 text-white"
            type="submit"
            disabled={isSubmitting && errors}
          >
            Log in
          </button>
        </Form>
      )}
    </Formik>
  );
}
