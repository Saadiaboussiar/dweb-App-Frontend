import { Box, Button, CardActions, Typography, useTheme } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { tokens } from "../../shared-theme/theme";
import { Link } from "react-router-dom";
import type { InterventionEssentials } from "../../data/interventions";

const InterCard = ({
  date,
  technicianFullName,
  client,
  ville,
  submittedAt,
  interId,
  updated,
  updateDateTime,
}: InterventionEssentials) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  console.log("is updated: ", updateDateTime);
  return (
    <Box>
      <Card
        sx={{
          maxWidth: 300,
          minWidth: 275,
          borderRadius: 3,
          background: updated
            ? `linear-gradient(50deg, ${colors.greenAccent[400]}, ${colors.greenAccent[700]})`
            : `linear-gradient(50deg, ${colors.primary[500]}, ${colors.blueAccent[700]})`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: updated
              ? `0px 0px 7px ${colors.greenAccent[100]}`
              : `0px 0px 7px ${colors.blueAccent[100]}`,
          },
        }}
      >
        <CardContent>
          <Typography
            variant="h2"
            component="div"
            sx={{ fontWeight: "bold", color: colors.grey[100] }}
          >
            {technicianFullName}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: updated ? colors.grey[600] : colors.grey[300],
              mb: 1.5,
            }}
          >
            Client : {client}
          </Typography>
          {updated ? (
            <Typography variant="h6" sx={{ color: colors.primary[100] }}>
              Modifié le {updateDateTime}
            </Typography>
          ) : (
            // Content to show when updated is false
            <>
              <Typography variant="h6" sx={{ color: colors.primary[100] }}>
                Adresse : {ville}
              </Typography>
              <Typography variant="h6" sx={{ color: colors.primary[100] }}>
                Date : {date}
              </Typography>
              <Typography variant="h6" sx={{ color: colors.primary[100] }}>
                Heure : {submittedAt}
              </Typography>
            </>
          )}
        </CardContent>

        <CardActions>
          <Button
            size="small"
            variant="contained"
            sx={{
              backgroundColor: updated
                ? colors.greenAccent[600]
                : colors.blueAccent[400],
              mb: "10px",
            }}
            component={Link}
            to={`/interventionDetails/${interId}`}
          >
            Plus de détails
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default InterCard;
