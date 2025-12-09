import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme/theme";
import { Card, CardContent, Typography } from "@mui/material";
import React from "react";

type InterventionInfosType = {
  client: string; //what will be? name or cin or what
  ville: string;
  km: number;
  technicianFN: string;
  technicianLN: string;
  date: string;
  startTime: string;
  finishTime: string;
  duration: string;
  nbreIntervenant: number;
};

interface Props {
  intervention: InterventionInfosType | undefined;
}
const InterventionInfos: React.FC<Props> = ({ intervention }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card
      sx={{
        maxWidth: 800,
        p: 2,
        m: "30px 0px 40px 150px",
        bgcolor: colors.blueAccent[800],
        borderRadius: "5px",
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Détails de l'intervention
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 1,
          }}
        >
          {intervention != undefined &&
            Object.entries(intervention).map(
              ([key, value]) =>
                formatLabel(key) != "interUrl" && (
                  <Box
                    key={key}
                    sx={{ border: "1px solid", p: 1, borderRadius: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {formatLabel(key)}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {value}
                    </Typography>
                  </Box>
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
  };
  return map[key] || key;
}

export default InterventionInfos;
