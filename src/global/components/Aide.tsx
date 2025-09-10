import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Container,
  Paper,
  AppBar,
  Toolbar,
  alpha,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { selectIsCollapsed } from "../../features/slices/layoutSlice";
import { tokens } from "../../shared-theme/theme";

// Création d'un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#8b5cf6",
      light: "#a78bfa",
      dark: "#7c3aed",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// Données FAQ en français
const faqData = [
  {
    id: 1,
    question: "Comment créer une nouvelle intervention ?",
    answer:
      "Pour créer une nouvelle intervention, allez dans l'onglet 'Nouvelle intervention'. Remplissez le formulaire avec les détails de l'intervention et les informations du client. Une fois terminé, cliquez sur 'Valider'.",
  },
  {
    id: 2,
    question: "Comment uploader un bon de travail ?",
    answer:
      "Après avoir rempli le formulaire d'intervention, vous pouvez uploader le bon de travail papier numérisé en cliquant sur le bouton 'Uploader un document'. Sélectionnez la photo et cliquez sur 'Ouvrir'. Le document sera associé à votre intervention.",
  },
  {
    id: 3,
    question: "Comment contacter le support ?",
    answer:
      "Vous pouvez nous contacter par email à support@dweb.com ou par téléphone au +33 1 23 45 67 89. Notre équipe est disponible du lundi au vendredi, de 9h à 18h.",
  },
];

const AideComponent = () => {
  const [expanded, setExpanded] = useState(1);
  const isCollapsed = useSelector(selectIsCollapsed);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 4,
        width: {
          xs: "80%",
          sm: "83%",
          md: "87%",
          lg: !isCollapsed ? "80%" : "90%",
        },
        ml: {
          xs: "100px",
          sm: "105px",
          md: "110px",
          lg: !isCollapsed ? "260px" : "120px",
        },
      }}
    >
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: colors.primary[100] }}
          >
            Comment pouvons-nous vous aider ?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ color: colors.grey[200] }}
          >
            Trouvez des réponses aux questions les plus fréquentes ou contactez
            notre support.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            bgcolor: colors.primary[400],
            borderRadius: 3,
            boxShadow: 8,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", mb: 3 }}
          >
            Questions Fréquentes
          </Typography>

          {faqData.map((faq) => (
            <Accordion
              key={faq.id}
              expanded={expanded === faq.id}
              onChange={handleChange(faq.id)}
              elevation={2}
              sx={{
                mb: 2,
                borderRadius: 3,
                bgcolor: colors.primary[600],
                overflow: "hidden",
                "&:before": { display: "none" },
                border: "1px solid",
                borderColor:
                  expanded === faq.id
                    ? colors.primary[300]
                    : colors.primary[300],
                "&:hover": {
                  borderColor: colors.primary[300],
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color:
                        expanded === faq.id
                          ? colors.primary[300]
                          : colors.primary[300],
                    }}
                  />
                }
                sx={{
                  bgcolor:
                    expanded === faq.id
                      ? colors.primary[500]
                      : colors.primary[500],
                  py: 2,
                  px: 3,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  py: 3,
                  px: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", lineHeight: 1.7 }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: colors.primary[400],
            borderRadius: 3,
            boxShadow: 8,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", mb: 3 }}
          >
            Contactez notre Support
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: colors.primary[400],
            }}
          >
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                bgcolor: colors.primary[600],
                border: "1px solid",
                borderColor: colors.primary[300],
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <EmailIcon sx={{ color: "white", fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    support@dweb.com
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                bgcolor: colors.primary[600],
                border: "1px solid",
                borderColor: colors.primary[300],
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <PhoneIcon sx={{ color: "white", fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Téléphone
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    +33 1 23 45 67 89
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                bgcolor: colors.primary[700],
                border: "1px solid",
                borderColor: colors.primary[300],
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <ScheduleIcon sx={{ color: "white", fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Horaires
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Lundi - Vendredi: 9h - 18h
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AideComponent;
