"use client";

import {
  useDoctorAppointment,
  useUpdateDoctorAppointment,
} from "@/hooks/doctor/useDoctor";
import { Formik, Form } from "formik";

import CustomInput from "@/components/CustomInput";

export const AppointmentId = ({ id }) => {
  const { data, isLoading, isError, error, refetch } = useDoctorAppointment(id);

  const { mutateAsync: updateAppointment } = useUpdateDoctorAppointment();

  if (isLoading) return <p>Loading appointment details</p>;
  if (isError) return <p>{`${error.message} - ${error.name}`}</p>;

  const {
    date,
    timeSlot,
    notes,
    reason,
    status,
    patientId: { _id, email, name },
  } = data;

  const updateActions = (status) => {
    switch (status) {
      case "pending":
        return [
          { key: "confirmed", label: "Confirm" },
          { key: "canceled", label: "Cancel" },
        ];
      case "confirmed":
        return [
          { key: "completed", label: "Complete" },
          { key: "canceled", label: "Cancel" },
        ];
      default:
        return [];
    }
  };

  const completeHandler = async (data) => {
    try {
      await updateAppointment({
        id,
        status: "completed",
      });
      console.log("success updating appointment: [completed]");
      refetch();
    } catch (error) {
      console.error("error updating appointment to completed: ", error);
      throw error;
    }
  };
  const confirmHandler = async (data) => {
    try {
      await updateAppointment({
        id,
        status: "confirmed",
      });
      console.log("success updating appointment: [confirmed]");
      refetch();
    } catch (error) {
      console.error("error updating appointment to confirmed: ", error);
      throw error;
    }
  };
  const cancelHandler = async (data) => {
    try {
      await updateAppointment({
        id,
        status: "canceled",
      });
      console.log("success updating appointment: [canceled]");
      refetch();
    } catch (error) {
      console.error("error updating appointment to canceled: ", error);
      throw error;
    }
  };

  return (
    <div>
      <p>p-name: {name}</p>
      <p>p-email: {email}</p>
      <div>
        <h3>Appointment details</h3>
        <p>Day - Time: {`${date} - ${timeSlot}`}</p>
        <p>Reason: {reason}</p>
        <p>Note: {notes}</p>
        <div>
          <Formik initialValues={status} onSubmit={() => {}}>
            {({ handleBlur }) => (
              <Form>
                <CustomInput
                  as={
                    status === "canceled" || status === "completed"
                      ? ""
                      : "select"
                  }
                  label="Status"
                  placeholder={
                    (status !== "canceled" || status !== "completed") && status
                  }
                  readOnly={!!(status === "canceled" || status === "completed")}
                  id="status"
                  name="status"
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    console.log("new status: ", newStatus);

                    if (newStatus == status) return; // Perform no action is old status equals new status.

                    switch (newStatus) {
                      case "completed":
                        await completeHandler();
                        break;
                      case "confirmed":
                        await confirmHandler();
                        break;
                      case "canceled":
                        await cancelHandler();
                        break;
                      default:
                        break;
                    }
                  }}
                  onBlur={handleBlur}
                >
                  <option value={status}>{status}</option>
                  {updateActions(status).map((action, index) => (
                    <option type="onSubmit" value={action.key} key={action.key}>
                      {action.label}
                    </option>
                  ))}
                </CustomInput>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
