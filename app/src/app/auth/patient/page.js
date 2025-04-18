"use client";
import React, { useState } from "react";
import { Form, Formik } from "formik";
import { AppState } from "@/store/context";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/CustomInput";

export default function PatientAuth() {
  const { signupHandler, signinHandler } = AppState();
  const [existingUser, setExistingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleExistingUser = () => {
    setTimeout(() => {
      setExistingUser((prevState) => !prevState);
    }, 500);
  };

  const handleSignup = async (values, actions) => {
    console.log(values);
    try {
      const role = "patient";

      const email = (values.email || "").trim();
      const password = values.password;
      const name = (values.name || "").trim();

      if (!name) throw new Error("Name is required");
      if (name.length < 6)
        throw new Error("Name must be at least 6 characters");

      if (!email) throw new Error("Email is required");
      if (!password) throw new Error("Password is required");
      if (password.length < 5)
        throw new Error("Password must be at least 6 characters");

      const user = await signupHandler(values, role);
      console.log("SIGNED_UP_USER: ", user);
      router.replace("/");
      actions.resetForm();
    } catch (error) {
      console.error("SIGNED_UP_USER_ERROR: ", error.message);
      actions.setSubmitting(false);
      throw error;
    }
  };

  const handleSignin = async (values, actions) => {
    try {
      const role = "patient";

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
    <div>
      <div className="mt-10 mb-10 flex items-center justify-center min-h-screen">
        <Formik
          initialValues={{
            email: "",
            name: "",
            password: "",
          }}
          onSubmit={existingUser ? handleSignup : handleSignin}
        >
          {({ values, handleChange, handleBlur, isSubmitting }) => (
            <Form className="w-full max-w-md p-4  rounded-lg shadow-xl">
              <div className="space-y-4">
                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className=" font-semibold text-center leading-7 text-2xl text-black bg-gray-800 w-60 rounded-md p-4 justify-center">
                    {existingUser ? "Create Account" : "Log In"}
                  </h2>

                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    {existingUser && (
                      <CustomInput
                        onChange={handleChange}
                        id="name"
                        name="name"
                        type="text"
                        onBlur={handleBlur}
                        value={values.name}
                        placeholder="Enter Name"
                        label="Name"
                      />
                    )}
                    <CustomInput
                      onChange={handleChange}
                      id="email"
                      name="email"
                      type="email"
                      onBlur={handleBlur}
                      value={values.email}
                      placeholder="Enter email address"
                      label="Email"
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
                      togglePassword={() => setShowPassword(!showPassword)}
                      showPassword={showPassword}
                    />
                  </div>

                  <div className="flex bg-gray-800 w-80 rounded-md p-4 justify-center">
                    <p className="block text-lg font-medium leading-6  text-red-500">
                      {existingUser
                        ? "Already have an account ?"
                        : "New user ?"}
                    </p>
                    <button
                      className="block ml-2 text-lg font-medium leading-6 text-white"
                      type="button"
                      onClick={handleExistingUser}
                    >
                      {existingUser ? "Log in" : "Create account"}
                    </button>
                  </div>

                  <div className="mt-10">
                    <button
                      className="block text-lg font-medium leading-6 rounded-md p-4 mx-4 my-4 bg-gray-800 text-white"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {existingUser ? "Create Account" : "Log in"}
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
