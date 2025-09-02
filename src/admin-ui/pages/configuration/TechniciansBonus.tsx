import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import AdminTechnicianBonusDashboard from "../../components/PointsDashAdmin";

const TechniciansBonus = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="LES BONUS DES TECHNICIENS"
          subTitle="Découvrez tous les avantages et récompenses pour nos techniciens"
        />
      </Box>
      <Box>
        <AdminTechnicianBonusDashboard/>
      </Box>
    </Box>
  );
};

export default TechniciansBonus;
