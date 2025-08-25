import * as React from "react";
import { useNavigate } from "react-router";
import useNotifications from "../../../hooks/useNotifications/useNotifications";
import {
  createClient,
  validateClient,
  type ClientData,
} from "../../../data/clientsInfos";
import ClientForm, {
  type FormFieldValue,
  type ClientFormState,
} from "./ClientForm";
import PageContainer from "../PageContainer";

const INITIAL_FORM_VALUES: Partial<ClientFormState["values"]> = {
  cin: "",
  fullName: "",
  reseauSocial: "",
  contrat: "",
  ville: "",
  adresse: "",
  email: "",
  phoneNumber: "",
};

export default function ClientCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<ClientFormState>({
    values: INITIAL_FORM_VALUES,
    errors: {},
  });

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<ClientFormState["values"]>) => {
      setFormState((prev) => ({
        ...prev,
        values: newFormValues,
      }));
    },
    []
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<ClientFormState["errors"]>) => {
      setFormState((prev) => ({
        ...prev,
        errors: newFormErrors,
      }));
    },
    []
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof ClientFormState["values"], value: FormFieldValue) => {
      const newFormValues = { ...formValues, [name]: value };
      setFormValues(newFormValues);

      const { issues } = validateClient(newFormValues);
      setFormErrors({
        ...formErrors,
        [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
      });
    },
    [formValues, formErrors, setFormErrors, setFormValues]
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
    setFormErrors({});
  }, [setFormValues, setFormErrors]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateClient(formValues);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(
          issues.map((issue) => [issue.path?.[0], issue.message])
        )
      );
      return;
    }
    setFormErrors({});

    try {
      const formData = new FormData();

       Object.entries(formValues).forEach(([key, value]) => {
          formData.append(key, String(value));
      });

      await createClient(formData);

      notifications.show("Client créé avec succès.", {
        severity: "success",
        autoHideDuration: 3000,
      });
      navigate("/clients");
    } catch (createError) {
      notifications.show(
        `Échec de la création du client. Raison: ${(createError as Error).message}`,
        {
          severity: "error",
          autoHideDuration: 3000,
        }
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="Nouveau Client"
      breadcrumbs={[
        { title: "Clients", path: "/clients" },
        { title: "Nouveau" },
      ]}
    >
      <ClientForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Ajouter"
      />
    </PageContainer>
  );
}
