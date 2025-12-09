import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme/theme";
import { Link } from "react-router-dom";

type TechnicianData = {
  techId: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileUrl: string;
};

const TechnicianCard = ({
  techId,
  firstName,
  lastName,
  email,
  phoneNumber,
  profileUrl,
}: TechnicianData) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // column on mobile, row on bigger screens
        width: "100%", // take full width by default
        maxWidth: { xs: "100%", sm: 500 }, // full width on mobile, 500px on desktop
        minWidth: 200,
        ml: { xs: "70px", sm: "50px" },
        background: colors.primary[700],
        borderRadius: "15px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: `0px 0px 4px ${colors.blueAccent[100]}`,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <CardContent
          sx={{
            flex: "1 0 auto",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // stack image above text on small screens
            alignItems: { xs: "center", sm: "flex-start" },
            justifyContent: "space-between",
            gap: "40px",
          }}
        >
          <CardMedia
            component="img"
            image={profileUrl}
            sx={{
              width: { xs: 100, sm: 150 },
              height: "auto",
              borderRadius: "100px",
              ml: { xs: 0, sm: "10px" },
            }}
          />
          <Box
            sx={{
              mt: { xs: 2, sm: "20px" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Typography variant="h2" fontWeight="400" color={colors.grey[200]}>
              {firstName}
            </Typography>
            <Typography variant="h2" fontWeight="400" color={colors.grey[200]}>
              {lastName}
            </Typography>
            <Typography variant="h4" color={colors.grey[500]}>
              {email}
            </Typography>
            <Typography variant="h4" color={colors.grey[500]}>
              {phoneNumber}
            </Typography>
          </Box>
        </CardContent>

        <Box
          sx={{
            ml: { xs: 0, sm: "45px" },
            mb: "5px",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <CardActions
            sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
          >
            <Button
              component={Link}
              to={`/technicians/${techId}`}
              size="medium"
              variant="contained"
              sx={{
                backgroundColor: colors.blueAccent[800],
                "&:hover": {
                  backgroundColor: colors.blueAccent[600],
                  transform: "scale(1.05)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              Voir profil
            </Button>
          </CardActions>
        </Box>
      </Box>
    </Card>
  );
};

export default TechnicianCard;
