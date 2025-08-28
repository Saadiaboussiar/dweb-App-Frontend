import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router";
import api from "../../Interceptors/api";
import axios from "axios";
import { useRef, useState } from "react";
import { Avatar, Card, IconButton, Typography, useTheme } from "@mui/material";
import { CameraAlt, CloudUpload, Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { tokens } from "../../shared-theme/theme";
import useNotifications from "../../hooks/useNotifications/useNotifications";

export interface InterventionFormProps {
  client: string; // client name (or CIN if you prefer)
  ville: string;
  km: number;
  technicianFN: string;
  technicianLN: string;
  date: string;
  startTime: string;
  finishTime: string;
  duration: string;
  nbreIntervenant: number;
  submittedAt: string;
}
interface BonIntervention {
  bonImage?: File | null;
  photoPreview?: string;
}

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function InterventionForm() {
  const navigate = useNavigate();
  const isCollapsed = useSelector(selectIsCollapsed);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const notifications = useNotifications();
  const [formData, setFormData] = React.useState<InterventionFormProps>({
    client: "",
    ville: "",
    km: 0,
    technicianFN: "",
    technicianLN: "",
    date: formatDate(new Date()),
    startTime: "",
    finishTime: "",
    duration: "",
    nbreIntervenant: 0,
    submittedAt: "",
  });
  const initialFormState: InterventionFormProps = {
    client: "",
    ville: "",
    km: 0,
    technicianFN: "",
    technicianLN: "",
    date: formatDate(new Date()),
    startTime: "",
    finishTime: "",
    duration: "",
    nbreIntervenant: 0,
    submittedAt: "",
  };

  const [file, setFile] = useState<BonIntervention>({
    bonImage: null,
    photoPreview: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFile((prev) => ({
        ...prev,
        bonImage: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemovePhoto = () => {
    if (file.photoPreview) {
      URL.revokeObjectURL(file.photoPreview);
    }
    setFile((prev) => ({ ...prev, bonImage: null, photoPreview: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: shouldConvertToNumber(name) ? safeConvertToNumber(value) : value,
    }));
  };

  // Helper functions
  const numericFields = ["km", "nbreIntervenant"]; // Add other numeric fields here

  const shouldConvertToNumber = (fieldName: string): boolean => {
    return numericFields.includes(fieldName);
  };

  const safeConvertToNumber = (value: string): number | string => {
    if (value === "" || value === null || value === undefined) return "";
    const num = Number(value);
    return isNaN(num) ? value : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formPayload = new FormData();
    const now = new Date();
    const submitTime = now
      .toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-");

    const bonInterventionData = {
      ...formData,
      submittedAt: submitTime,
      km: Number(formData.km),
      nbreIntervenant: Number(formData.nbreIntervenant),
    };
    formPayload.append(
      "bonIntervention",
      new Blob([JSON.stringify(bonInterventionData)], {
        type: "application/json",
      })
    );
    if (file.bonImage instanceof File) {
      formPayload.append("bonImage", file.bonImage);
    }

    try {
      const response = await api.post("/bonIntervention", formPayload);

      if (response !== null && response !== undefined && typeof response.data==='number') {
        notifications.show("Intervention enregistré avec sucées.", {
          severity: "success",
          autoHideDuration: 3000,
        });

        if (file.photoPreview) {
        URL.revokeObjectURL(file.photoPreview);
      }
      setFormData(initialFormState);
      setFile({ bonImage: null, photoPreview: "" });
    
      } else {
        notifications.show(
          "Intervention est bien enregistré, mais réponse inattendue du serveur.",
          {
            severity: "warning",
            autoHideDuration: 3000,
          }
        );
      }

      } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        const statusCode = error.response?.status;
        console.error(`Request failed with ${statusCode}:`, serverMessage);
        alert(serverMessage || `Server error (${statusCode})`);
      }
      {
        console.error("Unexpected error:", error);
        alert("Technical error occurred");
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      sx={{
        width: {
          xs: "100%", // Mobile (0-599px): always full width
          sm: "85%", // Tablet (600-899px)
          md: "80%",
          lg: isCollapsed ? "80%" : "75%", // Desktop (900px+)
        },
        ml: {
          xs: "130px",
          sm: "100px",
          md: "150px",
          lg: !isCollapsed ? "300px" : "180px",
        },
        mt: "30px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formData.client ?? ""}
              onChange={handleChange}
              name="client"
              label="Client"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.technicianFN ?? ""}
              onChange={handleChange}
              name="technicianFN"
              label="Prénom Du Technicien"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.technicianLN ?? ""}
              onChange={handleChange}
              name="technicianLN"
              label="Nom Du Technicien"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.ville ?? ""}
              onChange={handleChange}
              name="ville"
              label="Ville"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.km ?? 0}
              onChange={handleChange}
              name="km"
              label="KM"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.date ?? ""}
              onChange={handleChange}
              name="date"
              label="Date"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.startTime ?? ""}
              onChange={handleChange}
              name="startTime"
              label="Heure de Début"
              fullWidth
            />
            <TextField
              type="text"
              value={formData.finishTime ?? ""}
              onChange={handleChange}
              name="finishTime"
              label="Heure de fin"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.duration ?? ""}
              onChange={handleChange}
              name="duration"
              label="Durée"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 8, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              type="text"
              value={formData.nbreIntervenant ?? ""}
              onChange={handleChange}
              name="nbreIntervenant"
              label="Nombre d'Intervenants"
              fullWidth
            />
          </Grid>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              alignItems: "center",
              ml: {
                xs: "80px",
                sm: "180px",
                md: "290px",
                lg: !isCollapsed ? "425px" : "460px",
              },

              mt: "7px",
              transition: "margin-left 0.3s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                py: file.photoPreview ? 0 : 2,
              }}
            >
              {file.photoPreview ? (
                <>
                  <img
                    src={file.photoPreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: 200 }}
                  />
                  <Button
                    onClick={handleRemovePhoto}
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    sx={{ mt: 1 }}
                  >
                    Change Photo
                  </Button>
                </>
              ) : (
                <>
                  <CameraAlt fontSize="large" color="action" />
                  <Button
                    component="label"
                    variant="text"
                    startIcon={<CloudUpload />}
                  >
                    Select Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>
                </>
              )}
            </Box>
          </Card>
        </Grid>
      </FormGroup>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{
          ml: {
            xs: "110px",
            sm: "210px",
            md: "320px",
            lg: !isCollapsed ? "455px" : "490px",
          },

          mb: "20px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            bgcolor: colors.greenAccent[600],
            "&:hover": {
              bgcolor: colors.greenAccent[700],
              transform: "scale(1.04)",
            },
          }}
        >
          Valider
        </Button>
      </Stack>
    </Box>
  );
}
