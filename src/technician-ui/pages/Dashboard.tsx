import Box from "@mui/material/Box";
import Header from "../../global/components/Header";
import TechnicianDashboard from "../Components/DashboardComp";

const TechDashboard = () => {
  return (
    <>
      <Box m="20px">
        <Box  alignItems="center">
          <Header
            title="TABLEAU DE BORD"
            subTitle="Vue d'ensemble de vos performances, points et statistiques d'intervention
"
          />
          <TechnicianDashboard />
        </Box>
      </Box>
    </>
  );
};

export default TechDashboard;
