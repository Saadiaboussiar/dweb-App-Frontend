import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import ClientRentabiliteDashboard from "../../components/clients/clientAnalysisComp";

const ClientsAnalysis = () => {
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="LA RENTABILITE DES CLIENTS"
          subTitle="Analysez la valeur et la performance de chaque client"
        />
        <ClientRentabiliteDashboard />
      </Box>
    </Box>
  );
};

export default ClientsAnalysis;
