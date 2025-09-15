import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate, useParams } from "react-router";
import { useDialogs } from "../../hooks/useDialogs/useDialogs.tsx";
import useNotifications from "../../hooks/useNotifications/useNotifications.tsx";
import TextField from "@mui/material/TextField";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import PageContainer from "./PageContainer.tsx";
import {
  deleteIntervention,
  editIntervention,
  getFrenchName,
  getOneIntervention,
  type Intervention,
  
} from "../../data/interventions.ts";
import { tokens } from "../../shared-theme/theme.ts";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
} from "@mui/material";
import { useRoles } from "../../hooks/useRoles.ts";
import { updateIntervention } from "../../data/notifications.ts";

export default function InterventionShow() {
  const { interventionId } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIntervention, setEditedIntervention] = useState<Intervention | null>(null);

  const { isAdmin } = useRoles();

  const isValidImageUrl = (url: string | null | undefined) => {
    return (
      url &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/"))
    );
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  const dialogs = useDialogs();

  const notifications = useNotifications?.() || {
    show: (msg, opts) => console.log("Notification:", msg, opts),
    error: (msg: any, opts: any) =>
      console.error("Erreur de notification :", msg, opts),
  };

  const [intervention, setIntervention] = React.useState<Intervention | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getOneIntervention(Number(interventionId));

      setIntervention(showData);

      setEditedIntervention(showData);

      console.log("intervention: ", showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [interventionId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedIntervention(intervention);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedIntervention) return;

    try {
      setIsLoading(true);
      setIntervention(editedIntervention);
      setIsEditing(false);
      
      await editIntervention(intervention?.interId ?? 0,editedIntervention);

      notifications.show("Intervention modifiée avec succès.", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (updateError) {
      notifications.show(
        `Échec de la modification de l'intervention. Raison : ${
          (updateError as Error).message
        }`,
        {
          severity: "error",
          autoHideDuration: 3000,
        }
      );
    }
    setIsLoading(false);
  };

  const handleFieldChange = (field: keyof Intervention, value: string | number) => {
    if (editedIntervention) {
      setEditedIntervention({
        ...editedIntervention,
        [field]: value
      });
    }
  };

  console.log("status: ",intervention)
  const handleInterventionDelete = React.useCallback(async () => {
    if (!intervention) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Souhaitez-vous supprimer ${intervention.interId} ?`,
      {
        title: `Supprimer intervention ?`,
        severity: "error",
        okText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await deleteIntervention(Number(interventionId));
        navigate("/allInterventions");
        notifications.show("Intervention supprimé avec succès.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Échec de la suppression de l'intervention. Raison : ${
            (deleteError as Error).message
          }`,
          {
            severity: "error",
            autoHideDuration: 3000,
          }
        );
      }
      setIsLoading(false);
    }
  }, [intervention, dialogs, interventionId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate("/allInterventions");
  }, [navigate]);

  const pageTitle = `Intervention ${interventionId}`;

  const isRejected = intervention?.status === "REJECTED";

  return (
    
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: "Interventions", path: "/allIntervention" },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>
        {isLoading ? (
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
        ) : error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : intervention ? (
          <Box sx={{ flexGrow: 1, width: "100%", ml: " 20px" }}>
            {isRejected && isEditing && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Mode édition activé - Statut: Rejeté
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ width: "100%" }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Client</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      value={editedIntervention?.client || ""}
                      onChange={(e) => handleFieldChange("client", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.client}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">
                    Prénom de technicien
                  </Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      value={editedIntervention?.technicianFN || ""}
                      onChange={(e) => handleFieldChange("technicianFN", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.technicianFN}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Nom de technicien</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      value={editedIntervention?.technicianLN || ""}
                      onChange={(e) => handleFieldChange("technicianLN", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.technicianLN}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Ville</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      value={editedIntervention?.ville || ""}
                      onChange={(e) => handleFieldChange("ville", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.ville}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">KM</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={editedIntervention?.km || 0}
                      onChange={(e) => handleFieldChange("km", Number(e.target.value))}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.km}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Date</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      type="date"
                      value={editedIntervention?.date || ""}
                      onChange={(e) => handleFieldChange("date", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.date}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Heure Début</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      type="time"
                      value={editedIntervention?.startTime || ""}
                      onChange={(e) => handleFieldChange("startTime", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.startTime}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Heure Fin</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      type="time"
                      value={editedIntervention?.finishTime || ""}
                      onChange={(e) => handleFieldChange("finishTime", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.finishTime}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Durée</Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      value={editedIntervention?.duration || ""}
                      onChange={(e) => handleFieldChange("duration", e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.duration}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">
                    Nombre d'intervenant
                  </Typography>
                  {isRejected && isEditing ? (
                    <TextField
                      fullWidth
                      type="number"
                      value={editedIntervention?.nbreIntervenant || 0}
                      onChange={(e) => handleFieldChange("nbreIntervenant", Number(e.target.value))}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {intervention.nbreIntervenant}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper sx={{ px: 2, py: 1 }}>
                  <Typography variant="overline">Enregistré le:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {intervention.submittedAt}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              onClick={() => setIsOpen(true)}
              sx={{
                bgcolor: colors.greenAccent[800],
                borderColor: colors.greenAccent[500],
                color: colors.greenAccent[100],
                "&:hover": {
                  color: colors.blueAccent[200],
                  fontWeight: "bold",
                  backgroundColor: "transparent",
                  bgcolor: colors.greenAccent[700],
                },
                mt: "-80px",
                ml:"650px",
                width:"200px",
                height:"50px",
              }}
              size="large"
            >
              <Typography fontWeight="bold" variant="h5">Ouvrir la photo</Typography>
            </Button>

            <Dialog
              open={isOpen}
              onClose={() => setIsOpen(false)}
              aria-labelledby="draggable-dialog-title"
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  bgcolor: colors.primary[400],
                },
              }}
            >
              <DialogTitle
                id="draggable-dialog-title"
                sx={{
                  cursor: "move",
                  bgcolor: colors.primary[400],
                  borderBottom: `1px solid ${colors.blueAccent[700]}`,
                }}
              >
                Consultez la photo du bon d'intervention
              </DialogTitle>

              <DialogContent
                sx={{ bgcolor: colors.primary[400], position: "relative" }}
              >
                {!isValidImageUrl(intervention.interUrl) ? (
                  <Typography color="error" textAlign="center">
                    URL d'image invalide
                  </Typography>
                ) : imageError ? (
                  <Typography color="error" textAlign="center">
                    Impossible de charger l'image
                  </Typography>
                ) : (
                  <>
                    {imageLoading && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    )}

                    <Box
                      sx={{
                        position: "relative",
                        display: imageLoading ? "none" : "block",
                        width: "100%",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          intervention?.interUrl ||
                          "https://via.placeholder.com/600x400?text=Image+Not+Found"
                        }
                        alt="Bon d'intervention"
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageError(true)}
                        sx={{
                          width: "100%",
                          height: "auto",
                          objectFit: "contain",
                          transform: `scale(${zoom})`,
                          transition: "transform 0.3s ease",
                          display: "block",
                          maxHeight: "70vh",
                        }}
                      />

                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          display: "flex",
                          gap: 1,
                          bgcolor: "rgba(0,0,0,0.5)",
                          borderRadius: 1,
                          p: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={handleZoomOut}
                          sx={{ color: "white" }}
                          disabled={zoom <= 0.5}
                        >
                          <ZoomOutIcon />
                        </IconButton>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            px: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {Math.round(zoom * 100)}%
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={handleZoomIn}
                          sx={{ color: "white" }}
                          disabled={zoom >= 3}
                        >
                          <ZoomInIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Retour
              </Button>
              
              {isRejected && (
                <Stack direction="row" spacing={2}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                      >
                        Valider
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                    >
                      Modifier
                    </Button>
                  )}
                </Stack>
              )}
              
              {isAdmin && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleInterventionDelete}
                  >
                    Supprimer
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </PageContainer>
  );
}