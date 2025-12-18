import Box from "@mui/material/Box";
import Header from "../../../global/components/Header";
import ClientReportsDashboard from "../../components/clients/reportComp";

const ClintsReports = () => {
  return (
    <Box m="20px">
      <Box justifyContent="space-between" alignItems="center">
        <Header
          title="RAPORTS DES CLIENTS"
          subTitle="Génération de rapports détaillés par client avec métriques d'efficacité"
        />
        <ClientReportsDashboard/>
      </Box>
    </Box>
  );
};

export default ClintsReports;
