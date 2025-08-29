import React from "react";
import {  type Intervention } from "../../data/interventions";
import Box from "@mui/material/Box";
import { tokens } from "../../shared-theme/theme";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

interface Props {
  intervention?: Intervention;
}

const InterventionInfos: React.FC<Props> = ({ intervention }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  {
    /*#141b2d*/
  }
  if (!intervention) {
    return <Typography>Aucune intervention trouvée</Typography>;
  } else
    return (
      <Card
        sx={{
          maxWidth: 800,
          m: "auto",
          p: 2,
          mt: "40px",
          borderRadius: "10px",
          bgcolor: colors.primary[400],
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom mb="20px">
            Détails de l'intervention
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 2,
            }}
          >
            {Object.entries(intervention).map(
              ([key, value]) =>
                formatLabel(key) != "interUrl" && (
                  <TextField
                    key={key}
                    label={
                      formatLabel(key) === "interId" ? "Id" : formatLabel(key)
                    }
                    value={value}
                    variant="outlined"
                    size="medium"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      style: {
                        pointerEvents: "none", // disable all interactions
                        backgroundColor: colors.primary[500],
                        width: "300px",
                        height: "50px",
                      },
                    }}
                    InputLabelProps={{
                      style: { fontSize: "1.3rem" }, // bigger label
                    }}
                  />
                )
            )}
          </Box>
        </CardContent>
      </Card>
    );
};

function formatLabel(key: string) {
  const map: Record<string, string> = {
    client: "Client",
    ville: "Ville",
    km: "Kilométrage",
    technicianFN: "Prénom technicien",
    technicianLN: "Nom technicien",
    date: "Date",
    startTime: "Heure début",
    finishTime: "Heure fin",
    duration: "Durée",
    nbreIntervenant: "Nombre d'intervenants",
    submittedAt: "Enregistré le",
  };
  return map[key] || key;
}

export default InterventionInfos;
