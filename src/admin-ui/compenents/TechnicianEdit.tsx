import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate, useParams } from "react-router";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import {
  getOneTechnician as getOne,
  updateTechnician as updateOne,
  validateTechnician as validate,
  type TechnicianData,
} from "../../data/technicianInfos";
import EmployeeForm, {
  type FormFieldValue,
  type TechnicianFormState,
} from "./TechnicianForm";
import PageContainer from "./PageContainer";
import type { technicianData } from "data/technicians";

function TechnicianEditForm({
  initialValues,
  onSubmit,
}: {
  initialValues: Partial<TechnicianFormState["values"]>;
  onSubmit: (formValues: Partial<TechnicianFormState["values"]>) => Promise<void>;
}) {
  const { technicianId } = useParams();
  const navigate = useNavigate();

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<TechnicianFormState>(() => ({
    values: initialValues,
    errors: {},
  }));
  const formValues = formState.values;
  const formErrors = formState.errors;

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
        const { issues } = validate(values);
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
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

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
      notifications.show("Technician edited successfully.", {
        severity: "success",
        autoHideDuration: 3000,
      });

      navigate("/technicians");
    } catch (editError) {
      notifications.show(
        `Failed to edit technician. Reason: ${(editError as Error).message}`,
        {
          severity: "error",
          autoHideDuration: 3000,
        }
      );
      throw editError;
    }
  }, [formValues, navigate, notifications, onSubmit, setFormErrors]);

  return (
    <EmployeeForm
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel="Save"
      backButtonPath={`/technicians/${technicianId}`}
    />
  );
}

export default function TechnicianEdit() {
  const { technicianId } = useParams();

  const [tecnician, setTechnician] = React.useState<technicianData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getOne(Number(technicianId));

      setTechnician(showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [technicianId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = React.useCallback(
    async (formValues: Partial<TechnicianFormState["values"]>) => {
      const updatedData = await updateOne(Number(technicianId), formValues);
      setTechnician(updatedData);
    },
    [technicianId]
  );

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

    return tecnician ? (
      <TechnicianEditForm initialValues={tecnician} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, error, tecnician, handleSubmit]);

  return (
    <PageContainer
      title={`Edit Technician ${technicianId}`}
      breadcrumbs={[
        { title: "Technicians", path: "/technicians" },
        { title: `Technician ${technicianId}`, path: `/technicians/${technicianId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
