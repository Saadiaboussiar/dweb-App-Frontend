import { Box, Button, CardActions, Typography, useTheme } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { tokens } from "../../shared-theme/theme";
import { Link } from "react-router-dom";
import type {InterventionCard} from '../../data/interventions'



const InterCard = ({
  date,
  technicianFullName,
  client,
  ville,
  submittedAt,
  interId,
}: InterventionCard) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box>
      <Card
        sx={{
          maxWidth: 300,
          minWidth: 275,
          borderRadius: 3,
          background: `linear-gradient(50deg, ${colors.primary[500]}, ${colors.blueAccent[700]})`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: `0px 0px 7px ${colors.blueAccent[100]}`,
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

          <Typography variant="h5" sx={{ color: colors.grey[300], mb: 1.5 }}>
            Client : {client}
          </Typography>

          <Typography variant="h6" sx={{ color: colors.primary[100] }}>
            Adresse : {ville}
          </Typography>

          <Typography variant="h6" sx={{ color: colors.primary[100] }}>
            Date : {date}
          </Typography>

          <Typography variant="h6" sx={{ color: colors.primary[100] }}>
            Heure : {submittedAt}
          </Typography>
        </CardContent>

        <CardActions>
          <Button
            size="small"
            variant="contained"
            sx={{ backgroundColor: colors.blueAccent[400], mb: "10px" }}
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
