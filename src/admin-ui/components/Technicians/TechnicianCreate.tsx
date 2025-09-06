import * as React from "react";
import { useNavigate } from "react-router";
import useNotifications from "../../../hooks/useNotifications/useNotifications";
import {
  createTechnician,
  validateTechnician,
  type TechnicianData,
} from "../../../data/technicianInfos";
import TechnicianForm, {
  type FormFieldValue,
  type TechnicianFormState,
} from "./TechnicianForm";
import PageContainer from "../PageContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  selectTechnicianId,
  setTechnicianId,
} from "../../../features/slices/technicianAuthSlice";

const INITIAL_FORM_VALUES: Partial<TechnicianFormState["values"]> = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  cin: "",
  cnss: "",
  profileUrl: "",
};

export default function TechnicianCreate() {
  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<TechnicianFormState>(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

  const technicianId = useSelector(selectTechnicianId);
  const dispatch = useDispatch();

  const setFormValues = React.useCallback(
    (newFormValues: Partial<TechnicianFormState["values"]>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    []
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<TechnicianFormState["errors"]>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    []
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof TechnicianFormState["values"], value: FormFieldValue) => {
      const validateField = async (
        values: Partial<TechnicianFormState["values"]>
      ) => {
        const { issues } = validateTechnician(values);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, setFormErrors, setFormValues]
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
  }, [setFormValues]);

  const handleFormSubmit = React.useCallback(

    async (submittedValues: Partial<TechnicianFormState["values"]>) => {
      const { issues } = validateTechnician(formValues);

      if (issues && issues.length > 0) {
        setFormErrors(
          Object.fromEntries(
            issues.map((issue) => [issue.path?.[0], issue.message])
          )
        );
        return;
      }
      setFormErrors({});

      const formData = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });
      
      try {
        const result = await createTechnician(formData);

        if (result !== null && result !== undefined) {
          dispatch(setTechnicianId(result));
          console.log("id of technician :", technicianId);

          notifications.show("Technicien créé avec succès.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          navigate("/technicians");
        } else {
          notifications.show(
            "Technicien créé, mais réponse inattendue du serveur.",
            {
              severity: "warning",
              autoHideDuration: 3000,
            }
          );
        }

        navigate("/technicians");
      } catch (createError) {
        notifications.show(
          `Échec de la création du technicien. Raison: ${
            (createError as Error).message
          }`,
          {
            severity: "error",
            autoHideDuration: 3000,
          }
        );
        throw createError;
      }
    },
    [formValues, navigate, notifications, setFormErrors]
  );

  return (
    <PageContainer
      title="Nouveau technicien"
      breadcrumbs={[
        { title: "Techniciens", path: "/technicians" },
        { title: "Nouveau" },
      ]}
    >
      <TechnicianForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Ajouter"
      />
    </PageContainer>
  );
}
