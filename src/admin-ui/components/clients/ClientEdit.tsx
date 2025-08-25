import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate, useParams } from "react-router";
import useNotifications from "../../../hooks/useNotifications/useNotifications";
import {
  getOneClient as getOne,
  updateClient as updateOne,
  validateClient as validate,
  type ClientData,
} from "../../../data/clientsInfos";
import ClientForm, {
  type FormFieldValue,
  type ClientFormState,
} from "./ClientForm";
import PageContainer from "../PageContainer";

function ClientEditForm({
  initialValues,
  onSubmit,
}: {
  initialValues: Partial<ClientFormState["values"]>;
  onSubmit: (formValues: Partial<ClientFormState["values"]>) => Promise<void>;
}) {
  const { clientCin } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<ClientFormState>({
    values: initialValues,
    errors: {},
  });
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback(
    (newFormValues: Partial<ClientFormState["values"]>) => {
      setFormState((prev) => ({ ...prev, values: newFormValues }));
    },
    []
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<ClientFormState["errors"]>) => {
      setFormState((prev) => ({ ...prev, errors: newFormErrors }));
    },
    []
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof ClientFormState["values"], value: FormFieldValue) => {
      const newFormValues = { ...formValues, [name]: value };
      setFormValues(newFormValues);

      const { issues } = validate(newFormValues);
      setFormErrors({
        ...formErrors,
        [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
      });
    },
    [formValues, formErrors, setFormErrors, setFormValues]
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(initialValues);
    setFormErrors({});
  }, [initialValues, setFormValues, setFormErrors]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validate(formValues);
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
      await onSubmit(formValues);
      notifications.show("Client modifié avec succès.", {
        severity: "success",
        autoHideDuration: 3000,
      });
      navigate(`/clients/${clientCin}`);
      
    } catch (editError) {
      notifications.show(
        `Échec de la modification du client. Raison : ${(editError as Error).message}`,
        {
          severity: "error",
          autoHideDuration: 3000,
        }
      );
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, clientCin, setFormErrors]);

  return (
    <ClientForm
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Enregistrer"
      backButtonPath={`/clients/${clientCin}`}
    />
  );
}

export default function ClientEdit() {
  const { clientCin } = useParams();
  const [client, setClient] = React.useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const clientData = await getOne(String(clientCin));
      setClient(clientData);
    } catch (error) {
      setError(error as Error);
       
    }
    setIsLoading(false);
  }, [clientCin]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<ClientFormState["values"]>) => {

      const updatedData = await updateOne(String(clientCin), formValues);
      setClient(updatedData);
    },
    [clientCin]
  );
  console.log("cin to edit: ",clientCin)

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return client ? (
      <ClientEditForm initialValues={client} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, error, client, handleSubmit]);

  return (
    <PageContainer
      title={`Modifier Client ${clientCin}`}
      breadcrumbs={[
        { title: "Clients", path: "/clients" },
        { title: `Client ${clientCin}`, path: `/clients/${clientCin}` },
        { title: "Modifier" },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
