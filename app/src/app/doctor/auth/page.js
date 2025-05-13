"use client";

import CustomInput from "@/components/CustomInput";
import { signinSchema } from "@/schema/schema";
import { AppState } from "@/store/context";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DoctorAuthPage() {
  const { signinHandler } = AppState();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const showPasswordHandler = () => setShowPassword(!showPassword);

  const loginDoctorHandler = async (values, actions) => {
    try {
      const role = "doctor";

      const email = values.email.trim();
      const password = values.password;

      if (!email) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");
      if (password.length < 5)
        throw new Error("Password must be at least 6 characters");

       await signinHandler(email, password, role);
      console.log("doctor success login...");
      router.replace("/doctor/dashboard");
      actions.resetForm();
    } catch (error) {
      console.error("Error login to doctor account: ", error);
      actions.setSubmitting(false);
      throw new Error(error);
    }
  };

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      validationSchema={signinSchema}
      onSubmit={loginDoctorHandler}
    >
      {({
        values,
        handleBlur,
        handleChange,
        isSubmitting,
        errors,
        touched,
      }) => (
        <Form>
          <CustomInput
            name="email"
            placeholder="Email"
            label="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            id="email"
            type="email"
            errors={errors}
            touched={touched}
          />
          <CustomInput
            name="password"
            placeholder="Password"
            label="Password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            id="password"
            showPassword={showPassword}
            togglePassword={showPasswordHandler}
            type={showPassword ? "text" : "password"}
            errors={errors}
            touched={touched}
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "loading..." : "Login"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
