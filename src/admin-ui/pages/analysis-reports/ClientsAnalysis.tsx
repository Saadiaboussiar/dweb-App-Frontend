import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import ClientRentabiliteDashboard from "../../components/clients/clientAnalysisComp";

const ClientsAnalysis = () => {
  return (
    <Box m="20px">
      <Box justifyContent="space-between" alignItems="center">
        <Header
          title="LA RENTABILITE DES CLIENTS"
          subTitle="Analyse de l'efficacité par client, ville et période (basé sur les km parcourus)"
        />
        <ClientRentabiliteDashboard />
      </Box>
    </Box>
  );
};

export default ClientsAnalysis;
