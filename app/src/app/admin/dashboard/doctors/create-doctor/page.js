"use client";

import CustomInput from "@/components/CustomInput";
import {
  useCreateDoctor,
  useDoctorData,
  useDoctorsMeta,
} from "@/hooks/useAdmin";
import { createDoctorSchema } from "@/schema/schema";
import { Formik, Form, FieldArray } from "formik";
import { useRouter, useSearchParams, useParams } from "next/navigation";

export default function CreateDoctorPage() {
  const router = useRouter();

  const { data } = useDoctorsMeta();

  const specialization = data?.specialties;
  const department = data?.departments;

  const initialValues = {
    name: "",
    email: "",
    password: "",
    specialization: specialization,
    department: department,
    schedule: [
      {
        day: "",
        times: [""],
      },
    ],
  };

  const { mutateAsync: createDoctor } = useCreateDoctor();

  const createDoctorHandler = async (values, actions) => {
    try {
      console.log("creating");
      await createDoctor(values);
      console.log("success create doctor profile");
      router.push("/admin/dashboard/doctors");
      actions.resetForm({
        values: initialValues,
      });
    } catch (error) {
      console.error("Error creating doctor profile: ", error);
      throw error;
    }
  };

  return (
    <div>
      <h3>Create doctor profile.</h3>

      <Formik
        initialValues={initialValues}
        // validationSchema={createDoctorSchema}
        onSubmit={createDoctorHandler}
      >
        {({
          values,
          handleChange,
          handleBlur,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form className="space-y-4">
            <CustomInput
              placeholder="Doctor Name"
              label="Doctor Name"
              value={values.name}
              name="name"
              id="name"
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched}
              errors={errors}
              type="text"
            />

            <CustomInput
              placeholder="Doctor Email"
              label="Doctor Email"
              value={values.email}
              name="email"
              id="email"
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched}
              errors={errors}
              type="email"
            />

            <CustomInput
              placeholder="Doctor Password"
              label="Doctor Password"
              value={values.password}
              name="password"
              id="password"
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched}
              errors={errors}
              type="text"
            />

            {/* Specialization dropdown */}
            <div>
              <label>Specialization</label>
              <select
                name="specialization"
                value={values.specialization}
                onChange={handleChange}
                onBlur={handleBlur}
                className="border rounded p-2 w-full"
              >
                <option value="">Select specialization</option>
                {specialization?.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Department dropdown */}
            <div>
              <label>Department</label>
              <select
                name="department"
                value={values.department}
                onChange={handleChange}
                onBlur={handleBlur}
                className="border rounded p-2 w-full"
              >
                <option value="">Select department</option>
                {department?.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Array */}
            <div>
              <h4>Schedule</h4>
              <FieldArray name="schedule">
                {({ push, remove }) => (
                  <div className="space-y-6">
                    {values.schedule.map((scheduleItem, index) => (
                      <div key={index} className="border p-4 rounded space-y-2">
                        {/* Day input */}
                        <CustomInput
                          placeholder="Day (e.g., Monday)"
                          label="Day"
                          value={scheduleItem.day}
                          name={`schedule.${index}.day`}
                          id={`schedule.${index}.day`}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          touched={touched}
                          errors={errors}
                          type="text"
                        />

                        {/* Times array */}
                        <FieldArray name={`schedule.${index}.times`}>
                          {({ push: pushTime, remove: removeTime }) => (
                            <div>
                              {scheduleItem.times.map((time, timeIdx) => (
                                <div key={timeIdx} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    name={`schedule.${index}.times.${timeIdx}`}
                                    value={time}
                                    onChange={handleChange}
                                    placeholder="e.g., 10:00 AM - 10:30 AM"
                                    className="border p-2 rounded w-full"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeTime(timeIdx)}
                                    className="text-red-500"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => pushTime("")}
                                className="text-blue-500 mt-2"
                              >
                                + Add Time Slot
                              </button>
                            </div>
                          )}
                        </FieldArray>

                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 mt-2"
                        >
                          Remove Schedule
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push({ day: "", times: [""] })}
                      className="text-green-600 mt-4"
                    >
                      + Add New Schedule
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-6"
            >
              {isSubmitting ? "Creating..." : "Create Doctor"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
