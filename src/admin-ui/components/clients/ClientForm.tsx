import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { Dayjs } from "dayjs";
import type { ClientData } from "../../../data/clientsInfos";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export interface ClientFormState {
  values: Partial<ClientData>;
  errors: Partial<Record<keyof ClientFormState["values"], string>>;
}

export type FormFieldValue = string | string[] | number | boolean | File | null;

export interface ClientFormProps {
  formState: ClientFormState;
  onFieldChange: (
    name: keyof ClientFormState["values"],
    value: FormFieldValue
  ) => void;
  onSubmit: (formValues: Partial<ClientFormState["values"]>) => Promise<void>;
  onReset?: (formValues: Partial<ClientFormState["values"]>) => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function ClientForm(props: ClientFormProps) {
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
        event.target.name as keyof ClientFormState["values"],
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
    navigate(backButtonPath ?? "/clients");
  }, [navigate, backButtonPath]);

  const columns = [
    { field: "cin", headerName: "CIN", width: 150 },
    { field: "fullName", headerName: "Nom Complet", width: 200 },
    { field: "reseauSocial", headerName: "RÉSEAU SOCIAL", width: 150 },
    { field: "contrat", headerName: "TYPE DE CONTRAT", width: 150 },
    { field: "adresse", headerName: "ADRESSE", width: 150 },
    { field: "ville", headerName: "VILLE", width: 150 },
    { field: "email", headerName: "EMAIL", width: 200 },
    { field: "phoneNumber", headerName: "NUMÉRO DE TÉLÉPHONE", width: 150 },
  ];

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
              value={formValues.fullName ?? ""}
              onChange={handleTextFieldChange}
              name="fullName"
              label="NOM COMPLET"
              error={!!formErrors.fullName}
              helperText={formErrors.fullName ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.reseauSocial ?? ""}
              onChange={handleTextFieldChange}
              name="reseauSocial"
              label="RÉSEAU SOCIAL"
              error={!!formErrors.reseauSocial}
              helperText={formErrors.reseauSocial ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.contrat ?? ""}
              onChange={handleTextFieldChange}
              name="contrat"
              label="TYPE DE CONTRAT"
              error={!!formErrors.contrat}
              helperText={formErrors.contrat ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.ville ?? ""}
              onChange={handleTextFieldChange}
              name="ville"
              label="VILLE"
              error={!!formErrors.ville}
              helperText={formErrors.ville ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.adresse ?? ""}
              onChange={handleTextFieldChange}
              name="adresse"
              label="ADRESSE"
              error={!!formErrors.adresse}
              helperText={formErrors.adresse ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.email ?? ""}
              onChange={handleTextFieldChange}
              name="email"
              label="EMAIL"
              error={!!formErrors.email}
              helperText={formErrors.email ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.phoneNumber ?? ""}
              onChange={handleTextFieldChange}
              name="phoneNumber"
              label="NUMÉRO DE TÉLÉPHONE"
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber ?? " "}
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
          Retour
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}
