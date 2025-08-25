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
  deleteClient as deleteOne,
  getOneClient,
  type ClientData,
} from "../../../data/clientsInfos.ts";
import PageContainer from "../PageContainer.tsx";

export default function ClientShow() {
  const { clientCin } = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();

  const notifications = useNotifications?.() || {
    show: (msg, opts) => console.log("Notification:", msg, opts),
    error: (msg: any, opts: any) =>
      console.error("Notification Error:", msg, opts),
  };

  const [client, setClient] = React.useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const clientData = await getOneClient(String(clientCin));
      setClient(clientData);
    } catch (error) {
      setError(error as Error);
    }
    setIsLoading(false);
  }, [clientCin]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClientEdit = React.useCallback(() => {
    navigate(`/clients/${clientCin}/edit`);
  }, [navigate, clientCin]);

  const handleClientDelete = React.useCallback(async () => {
    if (!client) return;

    const confirmed = await dialogs.confirm(
      `Souhaitez-vous supprimer ${client.fullName} ?`,
      {
        title: `Supprimer le client ?`,
        severity: "error",
        okText: "Supprimer",
        cancelText: "Annuler",
      }
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await deleteOne(String(clientCin));
        navigate("/clients");
        notifications.show("Client supprimé avec succès.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Échec de la suppression du client. Raison : ${(deleteError as Error).message}`,
          {
            severity: "error",
            autoHideDuration: 3000,
          }
        );
      }
      setIsLoading(false);
    }
  }, [client, dialogs, clientCin, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate("/clients");
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

    return client ? (
      <Box sx={{ flexGrow: 1, width: "100%", ml: "20px" }}>
        <Grid container spacing={2} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">CIN</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {client.cin}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">NOM COMPLET</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {client.fullName}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">RÉSEAU SOCIAL</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {client.reseauSocial}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">TYPE DE CONTRAT</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {client.contrat}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">VILLE</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {client.ville}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">ADRESSE</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {client.adresse}
              </Typography>
            </Paper>
          </Grid>
          {client.email && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">EMAIL</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {client.email}
                </Typography>
              </Paper>
            </Grid>
          )}
          {client.phoneNumber && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">NUMÉRO DE TÉLÉPHONE</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {client.phoneNumber}
                </Typography>
              </Paper>
            </Grid>
          )}
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
              onClick={handleClientEdit}
            >
              Modifier
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClientDelete}
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
    client,
    handleBack,
    handleClientEdit,
    handleClientDelete,
  ]);

  const pageTitle = `Client ${clientCin}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: "Clients", path: "/clients" },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>{renderShow}</Box>
    </PageContainer>
  );
}
