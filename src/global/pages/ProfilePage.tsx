import Box from "@mui/material/Box";
import Header from "../components/Header";
import AideComponent from "../components/Aide";
import Profile from "../components/Profile";
import { authService } from "../../service/authService";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate=useNavigate();

  const handleLogout = () => {
  authService.removeTokens();
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userEmail");
  
  navigate("/");
};

const handleChangePassword = () => {
  
};
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="VOTRE PROFILE"
          subTitle="Vos informations personnelles et préférences"
        />
      </Box>
      <Box >
        <Profile onLogout={handleLogout} />
      </Box>
    </Box>
  );
};

export default ProfilePage;
