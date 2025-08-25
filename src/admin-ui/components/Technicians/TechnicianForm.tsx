import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Select, {
  type SelectChangeEvent,
  type SelectProps,
} from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { Dayjs } from "dayjs";
import type { TechnicianData } from "../../../data/technicianInfos";

export interface TechnicianFormState {
  values: Partial<Omit<TechnicianData, "id">>;
  errors: Partial<Record<keyof TechnicianFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface TechnicianFormProps {
  formState: TechnicianFormState;
  onFieldChange: (
    name: keyof TechnicianFormState["values"],
    value: FormFieldValue
  ) => void;
  onSubmit: (
    formValues: Partial<TechnicianFormState["values"]>
  ) => Promise<void>;
  onReset?: (formValues: Partial<TechnicianFormState["values"]>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function TechnicianForm(props: TechnicianFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit]
  );

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof TechnicianFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  const handleNumberFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof TechnicianFormState["values"],
        Number(event.target.value)
      );
    },
    [onFieldChange]
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onFieldChange(
        event.target.name as keyof TechnicianFormState["values"],
        checked
      );
    },
    [onFieldChange]
  );

  const handleDateFieldChange = React.useCallback(
    (fieldName: keyof TechnicianFormState["values"]) =>
      (value: Dayjs | null) => {
        if (value?.isValid()) {
          onFieldChange(fieldName, value.toISOString() ?? null);
        } else if (formValues[fieldName]) {
          onFieldChange(fieldName, null);
        }
      },
    [formValues, onFieldChange]
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(
        event.target.name as keyof TechnicianFormState["values"],
        event.target.value
      );
    },
    [onFieldChange]
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? "/technicians");
  }, [navigate, backButtonPath]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: "100%" }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.firstName ?? ""}
              onChange={handleTextFieldChange}
              name="firstName"
              label="Prénom"
              error={!!formErrors.firstName}
              helperText={formErrors.firstName ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formValues.lastName ?? ""}
              onChange={handleTextFieldChange}
              name="lastName"
              label="Nom"
              error={!!formErrors.lastName}
              helperText={formErrors.lastName ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formValues.email ?? ""}
              onChange={handleTextFieldChange}
              name="email"
              label="E-mail"
              error={!!formErrors.email}
              helperText={formErrors.email ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formValues.phoneNumber ?? ""}
              onChange={handleTextFieldChange}
              name="phoneNumber"
              label="Numéro de téléphone"
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formValues.cin ?? ""}
              onChange={handleTextFieldChange}
              name="cin"
              label="CIN"
              error={!!formErrors.cin}
              helperText={formErrors.cin ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formValues.cnss ?? ""}
              onChange={handleTextFieldChange}
              name="cnss"
              label="CNSS"
              error={!!formErrors.cnss}
              helperText={formErrors.cnss ?? " "}
              fullWidth
            />
          </Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Retourner
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}
