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
import { useNavigate, useParams } from "react-router";
import { useDialogs } from "../../../hooks/useDialogs/useDialogs.tsx";
import useNotifications from "../../../hooks/useNotifications/useNotifications.tsx";
import {
  deleteTechnician as deleteOne,
  getOneTechnician,
  type TechnicianData,
} from "../../../data/technicianInfos.ts";
import PageContainer from "../PageContainer.tsx";

export default function TechnicianShow() {
  const { technicianId } = useParams();
  const navigate = useNavigate();
  console.log(`[TechnicianShow] Récupération du technicien ID :`, technicianId);
  console.log(`[TechnicianShow] Test récupération #1:`, getOneTechnician(1));

  console.log("ID du technicien :", technicianId);

  const dialogs = useDialogs();

  const notifications = useNotifications?.() || {
    show: (msg, opts) => console.log("Notification:", msg, opts),
    error: (msg: any, opts: any) =>
      console.error("Erreur de notification :", msg, opts),
  };
  const [technician, setTechnician] = React.useState<TechnicianData | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getOneTechnician(Number(technicianId));
      setTechnician(showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [technicianId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTechnicianEdit = React.useCallback(() => {
    navigate(`/technicians/${technicianId}/edit`);
  }, [navigate, technicianId]);

  const handleTechnicianDelete = React.useCallback(async () => {
    if (!technician) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Souhaitez-vous supprimer ${technician.firstName} ${technician.lastName} ?`,
      {
        title: `Supprimer technicien ?`,
        severity: "error",
        okText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await deleteOne(Number(technicianId));

        navigate("/technicians");

        notifications.show("Technicien supprimé avec succès.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Échec de la suppression du technicien. Raison : ${
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
  }, [technician, dialogs, technicianId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate("/technicians");
  }, [navigate]);

  const renderShow = React.useMemo(() => {
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

    return technician ? (
      <Box sx={{ flexGrow: 1, width: "100%", ml: " 20px" }}>
        <Grid container spacing={2} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Prénom</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.firstName}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Nom</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.lastName}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.email}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Numéro de téléphone</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.phoneNumber}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">CIN</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.cin}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">CNSS</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.cnss}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Matricule de voiture</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {technician.carMatricule}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Retour
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleTechnicianEdit}
            >
              Modifier
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleTechnicianDelete}
            >
              Supprimer
            </Button>
          </Stack>
        </Stack>
      </Box>
    ) : null;
  }, [
    isLoading,
    error,
    technician,
    handleBack,
    handleTechnicianEdit,
    handleTechnicianDelete,
  ]);

  const pageTitle = `Technicien ${technicianId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: "Techniciens", path: "/technicians" },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>{renderShow}</Box>
    </PageContainer>
  );
}
